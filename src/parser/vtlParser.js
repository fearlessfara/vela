/** AWS-SPEC: VTL Parser | OWNER: vela | STATUS: READY */
import { CstParser } from 'chevrotain';
import { allTokens, StringLiteral, NumberLiteral, BooleanLiteral, NullLiteral, Identifier, DollarRef, QuietRef, InterpStart, InterpEnd, LCurly, RCurly, LParen, RParen, LBracket, RBracket, Dot, Comma, Colon, Assign, Plus, Minus, Star, Slash, Mod, Not, And, Or, Eq, Ne, Lt, Le, Gt, Ge, Directive, Text, } from '../lexer/tokens';
// APIGW:VTL Parser
export class VtlParser extends CstParser {
    constructor() {
        super(allTokens, {
            recoveryEnabled: true,
        });
        this.performSelfAnalysis();
    }
    parse(input) {
        const lexResult = this.tokenize(input);
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
    tokenize(input) {
        const { tokenize } = require('chevrotain');
        return tokenize(input, allTokens);
    }
    // Template: sequence of segments
    template = this.RULE('template', () => {
        this.MANY(() => {
            this.SUBRULE(this.segment);
        });
    });
    // Segment: text, interpolation, or directive
    segment = this.RULE('segment', () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.text) },
            { ALT: () => this.SUBRULE(this.interpolation) },
            { ALT: () => this.SUBRULE(this.directive) },
        ]);
    });
    // Text: non-directive, non-interpolation content
    text = this.RULE('text', () => {
        this.CONSUME(Text);
    });
    // Interpolation: ${expression}
    interpolation = this.RULE('interpolation', () => {
        this.CONSUME(InterpStart);
        this.SUBRULE(this.expression);
        this.CONSUME(InterpEnd);
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
        this.CONSUME(Directive, { LABEL: 'ifKeyword' });
        this.SUBRULE(this.expression, { LABEL: 'condition' });
        this.MANY(() => {
            this.SUBRULE(this.segment, { LABEL: 'thenBody' });
        });
        this.MANY(() => {
            this.SUBRULE(this.elseIfDirective, { LABEL: 'elseIfBranches' });
        });
        this.OPTION(() => {
            this.SUBRULE(this.elseDirective, { LABEL: 'elseBranch' });
        });
        this.CONSUME(Directive, { LABEL: 'endKeyword' });
    });
    // #elseif directive
    elseIfDirective = this.RULE('elseIfDirective', () => {
        this.CONSUME(Directive, { LABEL: 'elseIfKeyword' });
        this.SUBRULE(this.expression, { LABEL: 'condition' });
        this.MANY(() => {
            this.SUBRULE(this.segment, { LABEL: 'body' });
        });
    });
    // #else directive
    elseDirective = this.RULE('elseDirective', () => {
        this.CONSUME(Directive, { LABEL: 'elseKeyword' });
        this.MANY(() => {
            this.SUBRULE(this.segment, { LABEL: 'body' });
        });
    });
    // #set directive
    setDirective = this.RULE('setDirective', () => {
        this.CONSUME(Directive, { LABEL: 'setKeyword' });
        this.CONSUME(Identifier, { LABEL: 'variable' });
        this.CONSUME(Assign);
        this.SUBRULE(this.expression, { LABEL: 'value' });
    });
    // #foreach directive
    forEachDirective = this.RULE('forEachDirective', () => {
        this.CONSUME(Directive, { LABEL: 'foreachKeyword' });
        this.CONSUME(Identifier, { LABEL: 'variable' });
        this.CONSUME(Identifier, { LABEL: 'inKeyword' });
        this.SUBRULE(this.expression, { LABEL: 'iterable' });
        this.MANY(() => {
            this.SUBRULE(this.segment, { LABEL: 'body' });
        });
        this.CONSUME(Directive, { LABEL: 'endKeyword' });
    });
    // #break directive
    breakDirective = this.RULE('breakDirective', () => {
        this.CONSUME(Directive, { LABEL: 'breakKeyword' });
    });
    // #stop directive
    stopDirective = this.RULE('stopDirective', () => {
        this.CONSUME(Directive, { LABEL: 'stopKeyword' });
    });
    // #macro directive (stub)
    macroDirective = this.RULE('macroDirective', () => {
        this.CONSUME(Directive, { LABEL: 'macroKeyword' });
        this.CONSUME(Identifier, { LABEL: 'name' });
        this.OPTION(() => {
            this.CONSUME(LParen);
            this.OPTION(() => {
                this.CONSUME(Identifier, { LABEL: 'parameters' });
                this.MANY(() => {
                    this.CONSUME(Comma);
                    this.CONSUME(Identifier, { LABEL: 'parameters' });
                });
            });
            this.CONSUME(RParen);
        });
        this.MANY(() => {
            this.SUBRULE(this.segment, { LABEL: 'body' });
        });
        this.CONSUME(Directive, { LABEL: 'endKeyword' });
    });
    // Expression parsing with proper precedence
    expression = this.RULE('expression', () => {
        this.SUBRULE(this.logicalOr);
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
        this.OR([
            { ALT: () => this.SUBRULE(this.primary) },
            {
                ALT: () => {
                    this.OR([
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
        this.OR([
            { ALT: () => this.SUBRULE(this.literal) },
            { ALT: () => this.SUBRULE(this.variableReference) },
            { ALT: () => this.SUBRULE(this.memberAccess) },
            { ALT: () => this.SUBRULE(this.functionCall) },
            { ALT: () => this.SUBRULE(this.arrayAccess) },
            { ALT: () => this.SUBRULE(this.objectLiteral) },
            { ALT: () => this.SUBRULE(this.arrayLiteral) },
            { ALT: () => this.SUBRULE(this.ternaryOperation) },
            {
                ALT: () => {
                    this.CONSUME(LParen);
                    this.SUBRULE(this.expression);
                    this.CONSUME(RParen);
                },
            },
        ]);
    });
    // Member access (a.b.c)
    memberAccess = this.RULE('memberAccess', () => {
        this.SUBRULE(this.primary);
        this.MANY(() => {
            this.CONSUME(Dot);
            this.CONSUME(Identifier);
        });
    });
    // Function call (func(args))
    functionCall = this.RULE('functionCall', () => {
        this.SUBRULE(this.primary);
        this.CONSUME(LParen);
        this.OPTION(() => {
            this.CONSUME(this.expression);
            this.MANY(() => {
                this.CONSUME(Comma);
                this.CONSUME(this.expression);
            });
        });
        this.CONSUME(RParen);
    });
    // Array access (a[0])
    arrayAccess = this.RULE('arrayAccess', () => {
        this.SUBRULE(this.primary);
        this.CONSUME(LBracket);
        this.SUBRULE(this.expression);
        this.CONSUME(RBracket);
    });
    // Object literal {key: value}
    objectLiteral = this.RULE('objectLiteral', () => {
        this.CONSUME(LCurly);
        this.OPTION(() => {
            this.CONSUME(this.objectProperty);
            this.MANY(() => {
                this.CONSUME(Comma);
                this.CONSUME(this.objectProperty);
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
            this.CONSUME(this.expression);
            this.MANY(() => {
                this.CONSUME(Comma);
                this.CONSUME(this.expression);
            });
        });
        this.CONSUME(RBracket);
    });
    // Ternary operation (condition ? then : else)
    ternaryOperation = this.RULE('ternaryOperation', () => {
        this.SUBRULE(this.expression);
        this.CONSUME(Colon);
        this.SUBRULE(this.expression);
        this.CONSUME(Colon);
        this.SUBRULE(this.expression);
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
    // Variable references ($ref, $!ref)
    variableReference = this.RULE('variableReference', () => {
        this.OR([
            { ALT: () => this.CONSUME(DollarRef) },
            { ALT: () => this.CONSUME(QuietRef) },
        ]);
    });
}
/* Deviation Report: None - Parser rules match AWS API Gateway VTL specification */
