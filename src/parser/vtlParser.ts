/** Apache Velocity: VTL Parser | OWNER: vela | STATUS: READY */

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
  Range,
  IfDirective,
  ElseIfDirective,
  ElseDirective,
  SetDirective,
  ForEachDirective,
  BreakDirective,
  StopDirective,
  MacroDirective,
  EvaluateDirective,
  ParseDirective,
  IncludeDirective,
  EndDirective,
  AnyTextFragment,
  Newline,
} from '../lexer/tokens.js';

export class VtlParser extends CstParser {
  private debugMode: boolean = false;

  constructor(debugMode: boolean = false) {
    super(allTokens, {
      recoveryEnabled: true,
    });
    this.debugMode = debugMode;
    this.performSelfAnalysis();
  }

  parse(input: string) {
    const lexResult = this.lex(input);
    
    if (this.debugMode) {
      console.log('=== VTL PARSER DEBUG ===');
      console.log('Input:', input);
      console.log('\nLexer Result:');
      if (lexResult.errors.length > 0) {
        console.log('Lexer errors:');
        lexResult.errors.forEach(error => console.log(`- ${error.message}`));
      } else {
        console.log('Tokens:');
        lexResult.tokens.forEach((token, i) => {
          console.log(`${i}: ${token.tokenType.name}: "${token.image}"`);
        });
      }
    }
    
    if (lexResult.errors.length > 0) {
      return { errors: lexResult.errors, cst: null };
    }

    this.input = lexResult.tokens;
    const cst = this.template();
    
    if (this.debugMode) {
      console.log('\nParser Result:');
      if (this.errors.length > 0) {
        console.log('Parser errors:');
        this.errors.forEach(error => {
          console.log(`- ${error.message}`);
          console.log(`  Token: ${error.token?.image || 'N/A'}`);
          console.log(`  Line: ${error.token?.startLine || 'N/A'}, Column: ${error.token?.startColumn || 'N/A'}`);
        });
      } else {
        console.log('Parse successful!');
        console.log('CST:', JSON.stringify(cst, null, 2));
      }
      console.log('=== END DEBUG ===\n');
    }
    
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
            t === StopDirective || t === MacroDirective || t === EndDirective ||
            t === EvaluateDirective || t === ParseDirective || t === IncludeDirective
          );
        },
        ALT: () => this.SUBRULE(this.text),
      },
      { ALT: () => this.SUBRULE(this.interpolation) },
      { ALT: () => this.SUBRULE(this.directive) },
    ]);
  });

  // Text: non-directive, non-interpolation content (up to next # or $)
  // Per Java Parser.jjt line 1580: Whitespace can also be text
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
      { ALT: () => this.SUBRULE(this.evaluateDirective) },
      { ALT: () => this.SUBRULE(this.parseDirective) },
      { ALT: () => this.SUBRULE(this.includeDirective) },
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
    // "in" keyword: can be InKeyword token, TemplateText "in ", or Identifier "in"
    this.OR([
      { ALT: () => this.CONSUME(InKeyword, { LABEL: 'inKeyword' }) },
      {
        GATE: () => {
          const la = this.LA(1);
          // Check if it's any text fragment token with "in" content
          const isTextToken = la.tokenType.CATEGORIES?.some((c: any) => c.name === 'AnyTextFragment') ?? false;
          return isTextToken && la.image.trim() === 'in';
        },
        ALT: () => {
          // TemplateText or any AnyTextFragment capturing "in " or similar
          this.CONSUME(AnyTextFragment, { LABEL: 'inText' });
        },
      },
      {
        GATE: () => {
          const la = this.LA(1);
          return la.tokenType.name === 'Identifier' && la.image === 'in';
        },
        ALT: () => {
          // Identifier "in" + optional whitespace/newlines
          this.CONSUME(Identifier, { LABEL: 'inWord' });
        },
      },
    ]);
    this.SUBRULE(this.expression, { LABEL: 'iterable' });
    this.CONSUME(RParen);
    this.MANY({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== EndDirective && t !== ElseDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'body' });
      },
    });
    this.OPTION({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t === ElseDirective;
      },
      DEF: () => {
        this.CONSUME(ElseDirective, { LABEL: 'elseKeyword' });
        this.SUBRULE(this.elseBodySegments, { LABEL: 'elseBody' });
      },
    });
    this.CONSUME(EndDirective, { LABEL: 'endKeyword' });
  });

  // #break directive
  breakDirective = this.RULE('breakDirective', () => {
    this.CONSUME(BreakDirective, { LABEL: 'breakKeyword' });
  });

  // Else body segments for foreach
  elseBodySegments = this.RULE('elseBodySegments', () => {
    this.MANY1({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'elseBodySegment' });
      },
    });
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

  // #evaluate directive
  evaluateDirective = this.RULE('evaluateDirective', () => {
    this.CONSUME(EvaluateDirective, { LABEL: 'evaluateKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'expression' });
    this.CONSUME(RParen);
  });

  // #parse directive
  parseDirective = this.RULE('parseDirective', () => {
    this.CONSUME(ParseDirective, { LABEL: 'parseKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'expression' });
    this.CONSUME(RParen);
  });

  // #include directive
  includeDirective = this.RULE('includeDirective', () => {
    this.CONSUME(IncludeDirective, { LABEL: 'includeKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'expression' });
    this.CONSUME(RParen);
  });

  // Expression parsing with proper precedence
  expression = this.RULE('expression', () => {
    this.SUBRULE(this.conditional);
  });

  // Conditional (ternary) operation: condition ? then : else
  conditional = this.RULE('conditional', () => {
    this.SUBRULE(this.logicalOr);
    this.OPTION(() => {
      this.MANY1(() => this.CONSUME(Newline)); // Allow newlines before ?
      this.CONSUME(Question);
      this.MANY2(() => this.CONSUME2(Newline)); // Allow newlines after ?
      this.SUBRULE1(this.expression);
      this.MANY3(() => this.CONSUME3(Newline)); // Allow newlines before :
      this.CONSUME(Colon);
      this.MANY4(() => this.CONSUME4(Newline)); // Allow newlines after :
      this.SUBRULE2(this.expression);
    });
  });

  logicalOr = this.RULE('logicalOr', () => {
    this.SUBRULE(this.logicalAnd);
    this.MANY1(() => {
      this.MANY2(() => this.CONSUME(Newline)); // Allow newlines before operator
      this.CONSUME(Or);
      this.MANY3(() => this.CONSUME2(Newline)); // Allow newlines after operator
      this.SUBRULE2(this.logicalAnd);
    });
  });

  logicalAnd = this.RULE('logicalAnd', () => {
    this.SUBRULE(this.equality);
    this.MANY1(() => {
      this.MANY2(() => this.CONSUME(Newline)); // Allow newlines before operator
      this.CONSUME(And);
      this.MANY3(() => this.CONSUME2(Newline)); // Allow newlines after operator
      this.SUBRULE2(this.equality);
    });
  });

  equality = this.RULE('equality', () => {
    this.SUBRULE(this.relational);
    this.MANY1(() => {
      this.MANY2(() => this.CONSUME(Newline)); // Allow newlines before operator
      this.OR([
        { ALT: () => this.CONSUME(Eq) },
        { ALT: () => this.CONSUME(Ne) },
      ]);
      this.MANY3(() => this.CONSUME2(Newline)); // Allow newlines after operator
      this.SUBRULE2(this.relational);
    });
  });

  relational = this.RULE('relational', () => {
    this.SUBRULE(this.additive);
    this.MANY1(() => {
      this.MANY2(() => this.CONSUME(Newline)); // Allow newlines before operator
      this.OR([
        { ALT: () => this.CONSUME(Lt) },
        { ALT: () => this.CONSUME(Le) },
        { ALT: () => this.CONSUME(Gt) },
        { ALT: () => this.CONSUME(Ge) },
      ]);
      this.MANY3(() => this.CONSUME2(Newline)); // Allow newlines after operator
      this.SUBRULE2(this.additive);
    });
  });

  additive = this.RULE('additive', () => {
    this.SUBRULE(this.multiplicative);
    this.MANY1(() => {
      this.MANY2(() => this.CONSUME(Newline)); // Allow newlines before operator
      this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) },
      ]);
      this.MANY3(() => this.CONSUME2(Newline)); // Allow newlines after operator
      this.SUBRULE2(this.multiplicative);
    });
  });

  multiplicative = this.RULE('multiplicative', () => {
    this.SUBRULE(this.unary);
    this.MANY1(() => {
      this.MANY2(() => this.CONSUME(Newline)); // Allow newlines before operator
      this.OR([
        { ALT: () => this.CONSUME(Star) },
        { ALT: () => this.CONSUME(Slash) },
        { ALT: () => this.CONSUME(Mod) },
      ]);
      this.MANY3(() => this.CONSUME2(Newline)); // Allow newlines after operator
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
            this.MANY1(() => { 
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

  // Array literal [elem1, elem2] or range [1..3]
  arrayLiteral = this.RULE('arrayLiteral', () => {
    this.CONSUME(LBracket);
    this.OPTION(() => {
      this.OR([
        {
          GATE: () => {
            const la1 = this.LA(1);
            const la2 = this.LA(2);
            return la1.tokenType === NumberLiteral && la2.tokenType === Range;
          },
          ALT: () => {
            this.CONSUME(NumberLiteral, { LABEL: 'start' });
            this.CONSUME(Range, { LABEL: 'rangeOperator' });
            this.CONSUME1(NumberLiteral, { LABEL: 'end' });
          },
        },
        {
          ALT: () => {
            this.SUBRULE1(this.expression);
            this.MANY(() => {
              this.CONSUME(Comma);
              this.SUBRULE2(this.expression);
            });
          },
        },
      ]);
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

