/** AWS-SPEC: VTL Parser | OWNER: vela | STATUS: READY */
import { CstParser } from 'chevrotain';
export declare class VtlParser extends CstParser {
    constructor();
    parse(input: string): {
        errors: any;
        cst: null;
    } | {
        errors: import("chevrotain").IRecognitionException[];
        cst: import("chevrotain").CstNode;
    };
    private tokenize;
    template: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    segment: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    text: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    interpolation: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    directive: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    ifDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    elseIfDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    elseDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    setDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    forEachDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    breakDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    stopDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    macroDirective: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    expression: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    logicalOr: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    logicalAnd: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    equality: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    relational: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    additive: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    multiplicative: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    unary: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    primary: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    memberAccess: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    functionCall: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    arrayAccess: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    objectLiteral: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    objectProperty: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    arrayLiteral: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    ternaryOperation: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    literal: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
    variableReference: import("chevrotain").ParserMethod<[], import("chevrotain").CstNode>;
}
