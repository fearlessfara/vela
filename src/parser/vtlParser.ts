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
  // Word-form operators
  EqWord,
  NeWord,
  GtWord,
  GeWord,
  LtWord,
  LeWord,
  AndWord,
  OrWord,
  NotWord,
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
  MacroInvocationStart,
  EvaluateDirective,
  ParseDirective,
  IncludeDirective,
  EndDirective,
  EscapedDirective,
  AnyTextFragment,
  Newline,
  Whitespace,
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
        // Segment-based template parsing (default for Velocity templates)
        ALT: () => {
          this.MANY(() => {
            this.SUBRULE(this.segment);
          });
        },
      },
      {
        // Bare expression parsing (for programmatic use)
        GATE: () => {
          const t = this.LA(1).tokenType;
          return t === DollarRef || t === QuietRef || t === InterpStart ||
                 t === StringLiteral || t === NumberLiteral || t === BooleanLiteral ||
                 t === NullLiteral || t === Identifier;
        },
        ALT: () => this.SUBRULE(this.expression),
      },
    ]);
  });

  // Segment: text, interpolation, directive, or escaped directive
  segment = this.RULE('segment', () => {
    this.OR([
      {
        GATE: () => {
          const t = this.LA(1).tokenType;
          return !(
            t === DollarRef || t === QuietRef || t === InterpStart ||
            t === IfDirective || t === ElseIfDirective || t === ElseDirective ||
            t === SetDirective || t === ForEachDirective || t === BreakDirective ||
            t === StopDirective || t === MacroDirective || t === MacroInvocationStart ||
            t === EndDirective || t === EvaluateDirective || t === ParseDirective ||
            t === IncludeDirective || t === EscapedDirective
          );
        },
        ALT: () => this.SUBRULE(this.text),
      },
      { ALT: () => this.SUBRULE(this.interpolation) },
      { ALT: () => this.SUBRULE(this.directive) },
      { ALT: () => this.SUBRULE(this.escapedDirective) },
    ]);
  });

  // Text: non-directive, non-interpolation content (up to next # or $)
  // Per Java Parser.jjt line 1580: Whitespace can also be text
  text = this.RULE('text', () => {
    this.AT_LEAST_ONE(() => {
      this.CONSUME(AnyTextFragment);
    });
  });

  // Escaped directive: \#directive should be treated as literal text
  // The backslash will be stripped and the directive text retained
  escapedDirective = this.RULE('escapedDirective', () => {
    this.CONSUME(EscapedDirective);
  });

  // Interpolation:
  //  - ${ expression }
  //  - bare variable reference with suffixes
  interpolation = this.RULE('interpolation', () => {
    this.OR([
      {
        // ${identifier.property[index]} syntax
        GATE: () => {
          const la1 = this.LA(1);
          const la2 = this.LA(2);
          return la1.tokenType === InterpStart && la2.tokenType === Identifier;
        },
        ALT: () => {
          this.CONSUME1(InterpStart);
          this.SUBRULE1(this.bareVarChain);
          this.CONSUME1(RCurly);
        },
      },
      {
        // ${expression} syntax for complex expressions
        ALT: () => {
          this.CONSUME(InterpStart);
          this.SUBRULE(this.expression);
          this.CONSUME(RCurly);
        },
      },
      {
        // $var.chain syntax
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

  // Bare variable chain: identifier.suffix()[] etc. (for use inside ${...})
  bareVarChain = this.RULE('bareVarChain', () => {
    this.CONSUME(Identifier);
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
      { ALT: () => this.SUBRULE(this.macroInvocation) },
      { ALT: () => this.SUBRULE(this.evaluateDirective) },
      { ALT: () => this.SUBRULE(this.parseDirective) },
      { ALT: () => this.SUBRULE(this.includeDirective) },
    ]);
  });

  // #if directive
  ifDirective = this.RULE('ifDirective', () => {
    this.CONSUME(IfDirective, { LABEL: 'ifKeyword' });
    // Optional whitespace between directive and opening parenthesis
    this.MANY(() => this.CONSUME(Whitespace));
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
    // Capture optional whitespace after #end as postfix
    this.OPTION2(() => this.CONSUME1(Whitespace, { LABEL: 'postfix' }));
  });

  // #elseif directive
  elseIfDirective = this.RULE('elseIfDirective', () => {
    this.CONSUME(ElseIfDirective, { LABEL: 'elseIfKeyword' });
    // Optional whitespace between directive and opening parenthesis
    this.MANY1(() => this.CONSUME1(Whitespace));
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
    // Optional whitespace between directive and opening parenthesis
    this.MANY5(() => this.CONSUME6(Whitespace));
    this.CONSUME(LParen);
    // Optional whitespace after (
    this.MANY1(() => this.OR1([
      { ALT: () => this.CONSUME1(Whitespace) },
      { ALT: () => this.CONSUME1(Newline) },
    ]));
    this.CONSUME(DollarRef, { LABEL: 'variable' });
    // Optional whitespace after variable
    this.MANY2(() => this.OR2([
      { ALT: () => this.CONSUME2(Whitespace) },
      { ALT: () => this.CONSUME2(Newline) },
    ]));
    this.CONSUME(Assign);
    // Optional whitespace after =
    this.MANY3(() => this.OR3([
      { ALT: () => this.CONSUME3(Whitespace) },
      { ALT: () => this.CONSUME3(Newline) },
    ]));
    this.SUBRULE(this.expression, { LABEL: 'value' });
    // Optional whitespace before )
    this.MANY4(() => this.OR4([
      { ALT: () => this.CONSUME4(Whitespace) },
      { ALT: () => this.CONSUME4(Newline) },
    ]));
    this.CONSUME(RParen);
    // Don't capture whitespace-only as postfix - let extractPrefixPostfix handle it from Text segments
    // Postfix should only include newlines, not standalone whitespace
  });

  // #foreach directive
  forEachDirective = this.RULE('forEachDirective', () => {
    this.CONSUME(ForEachDirective, { LABEL: 'foreachKeyword' });
    // Optional whitespace between directive and opening parenthesis
    this.MANY1(() => this.CONSUME2(Whitespace));
    this.CONSUME(LParen);
    this.CONSUME(DollarRef, { LABEL: 'variable' });
    // Optional whitespace before "in" keyword
    this.MANY2(() => this.CONSUME3(Whitespace));
    // "in" keyword: match TemplateText or Identifier with "in" content
    this.OR([
      {
        GATE: () => {
          const la = this.LA(1);
          return (la.tokenType.CATEGORIES?.some((c: any) => c.name === 'AnyTextFragment') ?? false) && la.image.trim() === 'in';
        },
        ALT: () => {
          this.CONSUME(AnyTextFragment, { LABEL: 'inKeyword' });
        },
      },
      {
        GATE: () => {
          const la = this.LA(1);
          return la.tokenType.name === 'Identifier' && la.image === 'in';
        },
        ALT: () => {
          this.CONSUME(Identifier, { LABEL: 'inKeyword' });
        },
      },
    ]);
    // Optional whitespace after "in" keyword
    this.MANY3(() => this.CONSUME4(Whitespace));
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
    // Capture optional whitespace after #end as postfix
    this.OPTION1(() => this.CONSUME1(Whitespace, { LABEL: 'postfix' }));
  });

  // #break directive
  breakDirective = this.RULE('breakDirective', () => {
    this.CONSUME(BreakDirective, { LABEL: 'breakKeyword' });
    // Capture optional whitespace after directive as postfix
    this.OPTION(() => this.CONSUME(Whitespace, { LABEL: 'postfix' }));
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
    // Capture optional whitespace after directive as postfix
    this.OPTION(() => this.CONSUME(Whitespace, { LABEL: 'postfix' }));
  });

  // #macro directive (stub)
  macroDirective = this.RULE('macroDirective', () => {
    this.CONSUME(MacroDirective, { LABEL: 'macroKeyword' });
    this.CONSUME(LParen);
    this.CONSUME(Identifier, { LABEL: 'name' });
    // Optional whitespace after macro name and between parameters
    this.MANY1(() => this.CONSUME(Whitespace));
    this.MANY2(() => {
      // Macro parameters are $param1, $param2, etc.
      this.CONSUME(DollarRef, { LABEL: 'parameters' });
      this.MANY3(() => this.CONSUME1(Whitespace));
    });
    this.CONSUME(RParen);
    this.MANY4({
      GATE: () => {
        const t = this.LA(1).tokenType;
        return t !== EndDirective;
      },
      DEF: () => {
        this.SUBRULE(this.segment, { LABEL: 'body' });
      },
    });
    this.CONSUME(EndDirective, { LABEL: 'endKeyword' });
    // Capture optional whitespace after #end as postfix
    this.OPTION3(() => this.CONSUME2(Whitespace, { LABEL: 'postfix' }));
  });

  // Macro invocation: #macroName(arg1, arg2, ...) with comma or space separation
  macroInvocation = this.RULE('macroInvocation', () => {
    this.CONSUME(MacroInvocationStart, { LABEL: 'invocation' });
    this.CONSUME(LParen);
    this.MANY(() => this.CONSUME(Whitespace)); // Optional whitespace after (
    this.OPTION(() => {
      this.SUBRULE(this.expression, { LABEL: 'arguments' });
      this.MANY1(() => {
        // Argument separator: require either comma OR whitespace (or both)
        this.OR([
          {
            // Check if there's a comma (possibly after whitespace)
            GATE: () => {
              const la1 = this.LA(1);
              const la2 = this.LA(2);
              return la1.tokenType === Comma || la2.tokenType === Comma;
            },
            ALT: () => {
              // Comma with optional whitespace
              this.MANY2(() => this.CONSUME1(Whitespace));
              this.CONSUME(Comma);
              this.MANY3(() => this.CONSUME2(Whitespace));
            },
          },
          {
            // Space-separated (at least one whitespace required, no comma)
            ALT: () => {
              this.AT_LEAST_ONE(() => this.CONSUME3(Whitespace));
            },
          },
        ]);
        this.SUBRULE1(this.expression, { LABEL: 'arguments' });
      });
      this.MANY4(() => this.CONSUME4(Whitespace)); // Optional whitespace before )
    });
    this.CONSUME(RParen);
    // Capture optional whitespace after invocation as postfix
    this.OPTION1(() => this.CONSUME5(Whitespace, { LABEL: 'postfix' }));
  });

  // #evaluate directive
  evaluateDirective = this.RULE('evaluateDirective', () => {
    this.CONSUME(EvaluateDirective, { LABEL: 'evaluateKeyword' });
    // Optional whitespace between directive and opening parenthesis
    this.MANY(() => this.CONSUME(Whitespace));
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'expression' });
    this.CONSUME(RParen);
    // Capture optional whitespace after directive as postfix
    this.OPTION(() => this.CONSUME1(Whitespace, { LABEL: 'postfix' }));
  });

  // #parse directive
  parseDirective = this.RULE('parseDirective', () => {
    this.CONSUME(ParseDirective, { LABEL: 'parseKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'expression' });
    this.CONSUME(RParen);
    // Capture optional whitespace after directive as postfix
    this.OPTION(() => this.CONSUME1(Whitespace, { LABEL: 'postfix' }));
  });

  // #include directive
  includeDirective = this.RULE('includeDirective', () => {
    this.CONSUME(IncludeDirective, { LABEL: 'includeKeyword' });
    this.CONSUME(LParen);
    this.SUBRULE(this.expression, { LABEL: 'expression' });
    this.CONSUME(RParen);
    // Capture optional whitespace after directive as postfix
    this.OPTION(() => this.CONSUME1(Whitespace, { LABEL: 'postfix' }));
  });

  // Expression parsing with proper precedence
  expression = this.RULE('expression', () => {
    this.SUBRULE(this.conditional);
  });

  // Conditional (ternary) operation: condition ? then : else
  conditional = this.RULE('conditional', () => {
    this.SUBRULE(this.logicalOr);
    this.OPTION(() => {
      // Allow whitespace before ?
      this.MANY1(() => this.OR1([
        { ALT: () => this.CONSUME1(Whitespace) },
        { ALT: () => this.CONSUME1(Newline) },
      ]));
      this.CONSUME(Question);
      // Allow whitespace after ?
      this.MANY2(() => this.OR2([
        { ALT: () => this.CONSUME2(Whitespace) },
        { ALT: () => this.CONSUME2(Newline) },
      ]));
      this.SUBRULE1(this.expression);
      // Allow whitespace before :
      this.MANY3(() => this.OR3([
        { ALT: () => this.CONSUME3(Whitespace) },
        { ALT: () => this.CONSUME3(Newline) },
      ]));
      this.CONSUME(Colon);
      // Allow whitespace after :
      this.MANY4(() => this.OR4([
        { ALT: () => this.CONSUME4(Whitespace) },
        { ALT: () => this.CONSUME4(Newline) },
      ]));
      this.SUBRULE2(this.expression);
    });
  });

  logicalOr = this.RULE('logicalOr', () => {
    this.SUBRULE(this.logicalAnd);
    this.MANY1({
      // Only enter loop if there's an || or 'or' operator (possibly after whitespace)
      GATE: () => {
        let i = 1;
        let la = this.LA(i);
        // Skip whitespace tokens
        while (la && (la.tokenType === Whitespace || la.tokenType === Newline)) {
          i++;
          la = this.LA(i);
        }
        // Check if we found || or 'or'
        return la && (la.tokenType === Or || la.tokenType === OrWord);
      },
      DEF: () => {
        // Allow whitespace before operator
        this.MANY2(() => this.OR1([
          { ALT: () => this.CONSUME1(Whitespace) },
          { ALT: () => this.CONSUME1(Newline) },
        ]));
        this.OR2([
          { ALT: () => this.CONSUME(Or) },
          { ALT: () => this.CONSUME(OrWord) },
        ]);
        // Allow whitespace after operator
        this.MANY3(() => this.OR3([
          { ALT: () => this.CONSUME2(Whitespace) },
          { ALT: () => this.CONSUME2(Newline) },
        ]));
        this.SUBRULE2(this.logicalAnd);
      },
    });
  });

  logicalAnd = this.RULE('logicalAnd', () => {
    this.SUBRULE(this.equality);
    this.MANY1({
      // Only enter loop if there's an && or 'and' operator (possibly after whitespace)
      GATE: () => {
        let i = 1;
        let la = this.LA(i);
        // Skip whitespace tokens
        while (la && (la.tokenType === Whitespace || la.tokenType === Newline)) {
          i++;
          la = this.LA(i);
        }
        // Check if we found && or 'and'
        return la && (la.tokenType === And || la.tokenType === AndWord);
      },
      DEF: () => {
        // Allow whitespace before operator
        this.MANY2(() => this.OR1([
          { ALT: () => this.CONSUME1(Whitespace) },
          { ALT: () => this.CONSUME1(Newline) },
        ]));
        this.OR2([
          { ALT: () => this.CONSUME(And) },
          { ALT: () => this.CONSUME(AndWord) },
        ]);
        // Allow whitespace after operator
        this.MANY3(() => this.OR3([
          { ALT: () => this.CONSUME2(Whitespace) },
          { ALT: () => this.CONSUME2(Newline) },
        ]));
        this.SUBRULE2(this.equality);
      },
    });
  });

  equality = this.RULE('equality', () => {
    this.SUBRULE(this.relational);
    this.MANY1({
      // Only enter loop if there's an == or != or 'eq' or 'ne' operator (possibly after whitespace)
      GATE: () => {
        let i = 1;
        let la = this.LA(i);
        // Skip whitespace tokens
        while (la && (la.tokenType === Whitespace || la.tokenType === Newline)) {
          i++;
          la = this.LA(i);
        }
        // Check if we found ==, !=, 'eq', or 'ne'
        return la && (la.tokenType === Eq || la.tokenType === Ne || la.tokenType === EqWord || la.tokenType === NeWord);
      },
      DEF: () => {
        // Allow whitespace before operator
        this.MANY2(() => this.OR1([
          { ALT: () => this.CONSUME1(Whitespace) },
          { ALT: () => this.CONSUME1(Newline) },
        ]));
        this.OR2([
          { ALT: () => this.CONSUME(Eq) },
          { ALT: () => this.CONSUME(Ne) },
          { ALT: () => this.CONSUME(EqWord) },
          { ALT: () => this.CONSUME(NeWord) },
        ]);
        // Allow whitespace after operator
        this.MANY3(() => this.OR3([
          { ALT: () => this.CONSUME2(Whitespace) },
          { ALT: () => this.CONSUME2(Newline) },
        ]));
        this.SUBRULE2(this.relational);
      },
    });
  });

  relational = this.RULE('relational', () => {
    this.SUBRULE(this.additive);
    this.MANY1({
      // Only enter loop if there's a relational operator (possibly after whitespace)
      GATE: () => {
        let i = 1;
        let la = this.LA(i);
        // Skip whitespace tokens
        while (la && (la.tokenType === Whitespace || la.tokenType === Newline)) {
          i++;
          la = this.LA(i);
        }
        // Check if we found a <, <=, >, >=, 'lt', 'le', 'gt', or 'ge' operator
        return la && (la.tokenType === Lt || la.tokenType === Le || la.tokenType === Gt || la.tokenType === Ge ||
                     la.tokenType === LtWord || la.tokenType === LeWord || la.tokenType === GtWord || la.tokenType === GeWord);
      },
      DEF: () => {
        // Allow whitespace before operator
        this.MANY2(() => this.OR1([
          { ALT: () => this.CONSUME1(Whitespace) },
          { ALT: () => this.CONSUME1(Newline) },
        ]));
        this.OR2([
          { ALT: () => this.CONSUME(Lt) },
          { ALT: () => this.CONSUME(Le) },
          { ALT: () => this.CONSUME(Gt) },
          { ALT: () => this.CONSUME(Ge) },
          { ALT: () => this.CONSUME(LtWord) },
          { ALT: () => this.CONSUME(LeWord) },
          { ALT: () => this.CONSUME(GtWord) },
          { ALT: () => this.CONSUME(GeWord) },
        ]);
        // Allow whitespace after operator
        this.MANY3(() => this.OR3([
          { ALT: () => this.CONSUME2(Whitespace) },
          { ALT: () => this.CONSUME2(Newline) },
        ]));
        this.SUBRULE2(this.additive);
      },
    });
  });

  additive = this.RULE('additive', () => {
    this.SUBRULE(this.multiplicative);
    this.MANY1({
      // Only enter loop if there's a + or - operator (possibly after whitespace)
      GATE: () => {
        let i = 1;
        let la = this.LA(i);
        // Skip whitespace tokens
        while (la && (la.tokenType === Whitespace || la.tokenType === Newline)) {
          i++;
          la = this.LA(i);
        }
        // Check if we found a + or - operator
        return la && (la.tokenType === Plus || la.tokenType === Minus);
      },
      DEF: () => {
        // Allow whitespace before operator
        this.MANY2(() => this.OR1([
          { ALT: () => this.CONSUME1(Whitespace) },
          { ALT: () => this.CONSUME1(Newline) },
        ]));
        this.OR2([
          { ALT: () => this.CONSUME(Plus) },
          { ALT: () => this.CONSUME(Minus) },
        ]);
        // Allow whitespace after operator
        this.MANY3(() => this.OR3([
          { ALT: () => this.CONSUME2(Whitespace) },
          { ALT: () => this.CONSUME2(Newline) },
        ]));
        this.SUBRULE2(this.multiplicative);
      },
    });
  });

  multiplicative = this.RULE('multiplicative', () => {
    this.SUBRULE(this.unary);
    this.MANY1({
      // Only enter loop if there's a *, /, or % operator (possibly after whitespace)
      GATE: () => {
        let i = 1;
        let la = this.LA(i);
        // Skip whitespace tokens
        while (la && (la.tokenType === Whitespace || la.tokenType === Newline)) {
          i++;
          la = this.LA(i);
        }
        // Check if we found a *, /, or % operator
        return la && (la.tokenType === Star || la.tokenType === Slash || la.tokenType === Mod);
      },
      DEF: () => {
        // Allow whitespace before operator
        this.MANY2(() => this.OR1([
          { ALT: () => this.CONSUME1(Whitespace) },
          { ALT: () => this.CONSUME1(Newline) },
        ]));
        this.OR2([
          { ALT: () => this.CONSUME(Star) },
          { ALT: () => this.CONSUME(Slash) },
          { ALT: () => this.CONSUME(Mod) },
        ]);
        // Allow whitespace after operator
        this.MANY3(() => this.OR3([
          { ALT: () => this.CONSUME2(Whitespace) },
          { ALT: () => this.CONSUME2(Newline) },
        ]));
        this.SUBRULE2(this.unary);
      },
    });
  });

  unary = this.RULE('unary', () => {
    this.OR1([
      { ALT: () => this.SUBRULE(this.primary) },
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(Not) },
            { ALT: () => this.CONSUME(NotWord) },
            { ALT: () => this.CONSUME(Plus) },
            { ALT: () => this.CONSUME(Minus) },
          ]);
          // Consume optional whitespace after the operator
          this.MANY(() => this.OR3([
            { ALT: () => this.CONSUME(Whitespace) },
            { ALT: () => this.CONSUME(Newline) },
          ]));
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
    this.OR1([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.variableReference) },
      { ALT: () => this.SUBRULE(this.objectLiteral) },
      { ALT: () => this.SUBRULE(this.arrayLiteral) },
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.MANY1(() => this.OR2([
            { ALT: () => this.CONSUME1(Whitespace) },
            { ALT: () => this.CONSUME1(Newline) },
          ]));
          this.SUBRULE(this.expression);
          this.MANY2(() => this.OR3([
            { ALT: () => this.CONSUME2(Whitespace) },
            { ALT: () => this.CONSUME2(Newline) },
          ]));
          this.CONSUME(RParen);
        },
      },
    ]);
  });

  // Suffix operations: member access, function calls, array access
  suffix = this.RULE('suffix', () => {
    this.OR1([
      { ALT: () => { this.CONSUME(Dot); this.CONSUME(Identifier, { LABEL: 'prop' }); } },
      { ALT: () => {
          this.CONSUME(LParen);
          this.MANY1(() => this.OR2([
            { ALT: () => this.CONSUME1(Whitespace) },
            { ALT: () => this.CONSUME1(Newline) },
          ]));
          this.OPTION(() => {
            this.SUBRULE(this.expression, { LABEL: 'args' });
            this.MANY2(() => {
              this.MANY3(() => this.OR3([
                { ALT: () => this.CONSUME2(Whitespace) },
                { ALT: () => this.CONSUME2(Newline) },
              ]));
              this.CONSUME(Comma);
              this.MANY4(() => this.OR4([
                { ALT: () => this.CONSUME3(Whitespace) },
                { ALT: () => this.CONSUME3(Newline) },
              ]));
              this.SUBRULE2(this.expression, { LABEL: 'args' });
            });
          });
          this.MANY5(() => this.OR5([
            { ALT: () => this.CONSUME4(Whitespace) },
            { ALT: () => this.CONSUME4(Newline) },
          ]));
          this.CONSUME(RParen);
        }
      },
      { ALT: () => {
          this.CONSUME(LBracket);
          this.MANY6(() => this.OR6([
            { ALT: () => this.CONSUME5(Whitespace) },
            { ALT: () => this.CONSUME5(Newline) },
          ]));
          this.SUBRULE3(this.expression, { LABEL: 'index' });
          this.MANY7(() => this.OR7([
            { ALT: () => this.CONSUME6(Whitespace) },
            { ALT: () => this.CONSUME6(Newline) },
          ]));
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
    // Optional whitespace after [
    this.MANY1(() => this.OR1([
      { ALT: () => this.CONSUME(Whitespace) },
      { ALT: () => this.CONSUME(Newline) },
    ]));
    this.OPTION(() => {
      this.OR2([
        {
          GATE: () => {
            // Check if token at position 2 is Range to distinguish [expr..expr] from [expr, expr]
            const la2 = this.LA(2);
            return la2.tokenType === Range;
          },
          ALT: () => {
            this.SUBRULE(this.primary, { LABEL: 'start' });
            this.CONSUME(Range, { LABEL: 'rangeOperator' });
            this.SUBRULE1(this.primary, { LABEL: 'end' });
          },
        },
        {
          ALT: () => {
            this.SUBRULE1(this.expression);
            this.MANY2(() => {
              // Optional whitespace before comma
              this.MANY3(() => this.OR3([
                { ALT: () => this.CONSUME1(Whitespace) },
                { ALT: () => this.CONSUME1(Newline) },
              ]));
              this.CONSUME(Comma);
              // Optional whitespace after comma
              this.MANY4(() => this.OR4([
                { ALT: () => this.CONSUME2(Whitespace) },
                { ALT: () => this.CONSUME2(Newline) },
              ]));
              this.SUBRULE2(this.expression);
            });
          },
        },
      ]);
    });
    // Optional whitespace before ]
    this.MANY5(() => this.OR5([
      { ALT: () => this.CONSUME3(Whitespace) },
      { ALT: () => this.CONSUME3(Newline) },
    ]));
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

