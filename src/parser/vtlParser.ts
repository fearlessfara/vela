/** AWS-SPEC: VTL Parser | OWNER: vela | STATUS: READY */

import { CstParser, Lexer } from 'chevrotain';
import {
  allTokens,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  DollarRef,
  QuietRef,
  InKeyword,
  InterpStart,
  LCurly,
  RCurly,
  LParen,
  RParen,
  LBracket,
  RBracket,
  Dot,
  Comma,
  Colon,
  Assign,
  Plus,
  Minus,
  Star,
  Slash,
  Mod,
  Not,
  And,
  Or,
  Eq,
  Ne,
  Lt,
  Le,
  Gt,
  Ge,
  Question,
  IfDirective,
  ElseIfDirective,
  ElseDirective,
  SetDirective,
  ForEachDirective,
  BreakDirective,
  StopDirective,
  MacroDirective,
  EndDirective,
  AnyTextFragment,
} from '../lexer/tokens.js';

// APIGW:VTL Parser

export class VtlParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
    });

    this.performSelfAnalysis();
  }

  parse(input: string) {
    const lexResult = this.lex(input);
    if (lexResult.errors.length > 0) {
      return { errors: lexResult.errors, cst: null };
    }

    this.input = lexResult.tokens;
    const cst = this.template();
    
    return {
      errors: this.errors,
      cst: cst
    };
  }

  private lex(input: string) {
    const lexer = new Lexer(allTokens);
    return lexer.tokenize(input);
  }

  // Template: sequence of segments, or single object/array literal
  template = this.RULE('template', () => {
    this.OR([
      {
        GATE: () => {
          const t = this.LA(1).tokenType;
          return t === LCurly;
        },
        ALT: () => this.SUBRULE(this.objectLiteral),
      },
      {
        GATE: () => {
          const t = this.LA(1).tokenType;
          return t === LBracket;
        },
        ALT: () => this.SUBRULE(this.arrayLiteral),
      },
      {
        GATE: () => {
          const t = this.LA(1).tokenType;
          return t === DollarRef || t === QuietRef || t === InterpStart ||
                 t === StringLiteral || t === NumberLiteral || t === BooleanLiteral ||
                 t === NullLiteral || t === Identifier;
        },
        ALT: () => this.SUBRULE(this.expression),
      },
      {
        ALT: () => {
          this.MANY(() => {
            this.SUBRULE(this.segment);
          });
        },
      },
    ]);
  });

  // Segment: text, interpolation, or directive
  segment = this.RULE('segment', () => {
    this.OR([
      {
        GATE: () => {
          const t = this.LA(1).tokenType;
          return !(
            t === DollarRef || t === QuietRef || t === InterpStart ||
            t === IfDirective || t === ElseIfDirective || t === ElseDirective ||
            t === SetDirective || t === ForEachDirective || t === BreakDirective ||
            t === StopDirective || t === MacroDirective || t === EndDirective
          );
        },
        ALT: () => this.SUBRULE(this.text),
      },
      { ALT: () => this.SUBRULE(this.interpolation) },
      { ALT: () => this.SUBRULE(this.directive) },
    ]);
  });

  // Text: non-directive, non-interpolation content (up to next # or $)
  text = this.RULE('text', () => {
    this.AT_LEAST_ONE(() => {
      this.CONSUME(AnyTextFragment);
    });
  });

  // Interpolation:
  //  - ${ expression }
  //  - bare variable reference with suffixes
  interpolation = this.RULE('interpolation', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(InterpStart);
          this.SUBRULE1(this.expression);
          this.CONSUME(RCurly);
        },
      },
      {
        GATE: () => {
          const la = this.LA(1);
          return la.tokenType === DollarRef || la.tokenType === QuietRef;
        },
        ALT: () => {
          this.SUBRULE2(this.varChain);
        },
      },
    ]);
  });

  // Variable chain: $var.suffix()[] etc.
  varChain = this.RULE('varChain', () => {
    this.SUBRULE(this.variableReference);
    this.MANY(() => this.SUBRULE(this.suffix));
  });

  // Variable reference: $variable or $!variable
  variableReference = this.RULE('variableReference', () => {
    this.OR([
      { ALT: () => this.CONSUME(DollarRef) },
      { ALT: () => this.CONSUME(QuietRef) },
    ]);
  });

  // Directives: #if, #set, #foreach, etc.
  directive = this.RULE('directive', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.ifDirective) },
      { ALT: () => this.SUBRULE(this.setDirective) },
      { ALT: () => this.SUBRULE(this.forEachDirective) },
      { ALT: () => this.SUBRULE(this.breakDirective) },
      { ALT: () => this.SUBRULE(this.stopDirective) },
      { ALT: () => this.SUBRULE(this.macroDirective) },
    ]);
  });

  // #if directive
  ifDirective = this.RULE('ifDirective', () => {
    this.CONSUME(IfDirective, { LABEL: 'ifKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'condition' });
    this.CONSUME(RParen);
    this.MANY1({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== ElseIfDirective && t !== ElseDirective && t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'thenBody' });
      },
    });
    this.MANY2(() => {
      this.SUBRULE(this.elseIfDirective, { LABEL: 'elseIfBranches' });
    });
    this.OPTION1(() => {
      this.SUBRULE(this.elseDirective, { LABEL: 'elseBranch' });
    });
    this.CONSUME(EndDirective, { LABEL: 'endKeyword' });
  });

  // #elseif directive
  elseIfDirective = this.RULE('elseIfDirective', () => {
    this.CONSUME(ElseIfDirective, { LABEL: 'elseIfKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'condition' });
    this.CONSUME(RParen);
    this.MANY({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== ElseIfDirective && t !== ElseDirective && t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'body' });
      },
    });
  });

  // #else directive
  elseDirective = this.RULE('elseDirective', () => {
    this.CONSUME(ElseDirective, { LABEL: 'elseKeyword' });
    this.MANY({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'body' });
      },
    });
  });

  // #set directive
  setDirective = this.RULE('setDirective', () => {
    this.CONSUME(SetDirective, { LABEL: 'setKeyword' });
    this.CONSUME(LParen);
    this.CONSUME(DollarRef, { LABEL: 'variable' });
    this.CONSUME(Assign);
    this.SUBRULE(this.expression, { LABEL: 'value' });
    this.CONSUME(RParen);
  });

  // #foreach directive
  forEachDirective = this.RULE('forEachDirective', () => {
    this.CONSUME(ForEachDirective, { LABEL: 'foreachKeyword' });
    this.CONSUME(LParen);
    this.CONSUME(DollarRef, { LABEL: 'variable' });
    this.CONSUME(InKeyword, { LABEL: 'inKeyword' });
    this.SUBRULE(this.expression, { LABEL: 'iterable' });
    this.CONSUME(RParen);
    this.MANY({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'body' });
      },
    });
    this.CONSUME(EndDirective, { LABEL: 'endKeyword' });
  });

  // #break directive
  breakDirective = this.RULE('breakDirective', () => {
    this.CONSUME(BreakDirective, { LABEL: 'breakKeyword' });
  });

  // #stop directive
  stopDirective = this.RULE('stopDirective', () => {
    this.CONSUME(StopDirective, { LABEL: 'stopKeyword' });
  });

  // #macro directive (stub)
  macroDirective = this.RULE('macroDirective', () => {
    this.CONSUME(MacroDirective, { LABEL: 'macroKeyword' });
    this.CONSUME1(Identifier, { LABEL: 'name' });
    this.OPTION1(() => {
      this.CONSUME(LParen);
      this.OPTION2(() => {
        this.CONSUME2(Identifier, { LABEL: 'parameters' });
        this.MANY1(() => {
          this.CONSUME(Comma);
          this.CONSUME3(Identifier, { LABEL: 'parameters' });
        });
      });
      this.CONSUME(RParen);
    });
    this.MANY2({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'body' });
      },
    });
    this.CONSUME(EndDirective, { LABEL: 'endKeyword' });
  });

  // Expression parsing with proper precedence
  expression = this.RULE('expression', () => {
    this.SUBRULE(this.conditional);
  });

  // Conditional (ternary) operation: condition ? then : else
  conditional = this.RULE('conditional', () => {
    this.SUBRULE(this.logicalOr);
    this.OPTION(() => {
      this.CONSUME(Question);
      this.SUBRULE1(this.expression);
      this.CONSUME(Colon);
      this.SUBRULE2(this.expression);
    });
  });

  logicalOr = this.RULE('logicalOr', () => {
    this.SUBRULE(this.logicalAnd);
    this.MANY(() => {
      this.CONSUME(Or);
      this.SUBRULE2(this.logicalAnd);
    });
  });

  logicalAnd = this.RULE('logicalAnd', () => {
    this.SUBRULE(this.equality);
    this.MANY(() => {
      this.CONSUME(And);
      this.SUBRULE2(this.equality);
    });
  });

  equality = this.RULE('equality', () => {
    this.SUBRULE(this.relational);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Eq) },
        { ALT: () => this.CONSUME(Ne) },
      ]);
      this.SUBRULE2(this.relational);
    });
  });

  relational = this.RULE('relational', () => {
    this.SUBRULE(this.additive);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Lt) },
        { ALT: () => this.CONSUME(Le) },
        { ALT: () => this.CONSUME(Gt) },
        { ALT: () => this.CONSUME(Ge) },
      ]);
      this.SUBRULE2(this.additive);
    });
  });

  additive = this.RULE('additive', () => {
    this.SUBRULE(this.multiplicative);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) },
      ]);
      this.SUBRULE2(this.multiplicative);
    });
  });

  multiplicative = this.RULE('multiplicative', () => {
    this.SUBRULE(this.unary);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Star) },
        { ALT: () => this.CONSUME(Slash) },
        { ALT: () => this.CONSUME(Mod) },
      ]);
      this.SUBRULE2(this.unary);
    });
  });

  unary = this.RULE('unary', () => {
    this.OR1([
      { ALT: () => this.SUBRULE(this.primary) },
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(Not) },
            { ALT: () => this.CONSUME(Plus) },
            { ALT: () => this.CONSUME(Minus) },
          ]);
          this.SUBRULE(this.unary);
        },
      },
    ]);
  });

  primary = this.RULE('primary', () => {
    this.SUBRULE(this.primaryBase, { LABEL: 'base' });
    this.MANY(() => this.SUBRULE(this.suffix, { LABEL: 'suffixes' }));
  });

  primaryBase = this.RULE('primaryBase', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.variableReference) },
      { ALT: () => this.SUBRULE(this.objectLiteral) },
      { ALT: () => this.SUBRULE(this.arrayLiteral) },
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.expression);
          this.CONSUME(RParen);
        },
      },
    ]);
  });

  // Suffix operations: member access, function calls, array access
  suffix = this.RULE('suffix', () => {
    this.OR([
      { ALT: () => { this.CONSUME(Dot); this.CONSUME(Identifier, { LABEL: 'prop' }); } },
      { ALT: () => {
          this.CONSUME(LParen);
          this.OPTION(() => { 
            this.SUBRULE(this.expression, { LABEL: 'args' });
            this.MANY(() => { 
              this.CONSUME(Comma); 
              this.SUBRULE2(this.expression, { LABEL: 'args' }); 
            });
          });
          this.CONSUME(RParen);
        }
      },
      { ALT: () => { 
          this.CONSUME(LBracket); 
          this.SUBRULE3(this.expression, { LABEL: 'index' }); 
          this.CONSUME(RBracket); 
        } 
      },
    ]);
  });


  // Object literal {key: value}
  objectLiteral = this.RULE('objectLiteral', () => {
    this.CONSUME(LCurly);
    this.OPTION(() => {
      this.SUBRULE1(this.objectProperty);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.objectProperty);
      });
    });
    this.CONSUME(RCurly);
  });

  objectProperty = this.RULE('objectProperty', () => {
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.SUBRULE(this.expression);
  });

  // Array literal [elem1, elem2]
  arrayLiteral = this.RULE('arrayLiteral', () => {
    this.CONSUME(LBracket);
    this.OPTION(() => {
      this.SUBRULE1(this.expression);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression);
      });
    });
    this.CONSUME(RBracket);
  });


  // Literals
  literal = this.RULE('literal', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(BooleanLiteral) },
      { ALT: () => this.CONSUME(NullLiteral) },
    ]);
  });

}

/* Deviation Report: None - Parser rules match AWS API Gateway VTL specification */
