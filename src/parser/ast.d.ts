/** Apache Velocity: AST Types | OWNER: vela | STATUS: READY */
export interface Position {
    line: number;
    column: number;
    offset: number;
}
export interface SourceLocation {
    start: Position;
    end: Position;
}
export interface BaseNode {
    type: string;
    location?: SourceLocation;
}
export interface Template extends BaseNode {
    type: 'Template';
    segments: Segment[];
}
export type Segment = Text | Interpolation | VariableReference | Directive;
export interface Text extends BaseNode {
    type: 'Text';
    value: string;
}
export interface Interpolation extends BaseNode {
    type: 'Interpolation';
    expression: Expression;
}
export interface IfDirective extends BaseNode {
    type: 'IfDirective';
    condition: Expression;
    thenBody: Segment[];
    elseIfBranches: ElseIfBranch[];
    elseBody?: Segment[];
}
export interface ElseIfBranch extends BaseNode {
    type: 'ElseIfBranch';
    condition: Expression;
    body: Segment[];
}
export interface SetDirective extends BaseNode {
    type: 'SetDirective';
    variable: string;
    value: Expression;
}
export interface ForEachDirective extends BaseNode {
    type: 'ForEachDirective';
    variable: string;
    iterable: Expression;
    body: Segment[];
    elseBody?: Segment[];
}
export interface BreakDirective extends BaseNode {
    type: 'BreakDirective';
}
export interface StopDirective extends BaseNode {
    type: 'StopDirective';
}
export interface MacroDirective extends BaseNode {
    type: 'MacroDirective';
    name: string;
    parameters: string[];
    body: Segment[];
}
export interface EvaluateDirective extends BaseNode {
    type: 'EvaluateDirective';
    expression: Expression;
}
export interface ParseDirective extends BaseNode {
    type: 'ParseDirective';
    expression: Expression;
}
export interface IncludeDirective extends BaseNode {
    type: 'IncludeDirective';
    expression: Expression;
}
export type Directive = IfDirective | SetDirective | ForEachDirective | BreakDirective | StopDirective | MacroDirective | EvaluateDirective | ParseDirective | IncludeDirective;
export type Expression = Literal | VariableReference | MemberAccess | FunctionCall | ArrayAccess | ObjectLiteral | ArrayLiteral | RangeLiteral | BinaryOperation | UnaryOperation | TernaryOperation;
export interface Literal extends BaseNode {
    type: 'Literal';
    value: string | number | boolean | null;
}
export interface VariableReference extends BaseNode {
    type: 'VariableReference';
    name: string;
    quiet: boolean;
}
export interface MemberAccess extends BaseNode {
    type: 'MemberAccess';
    object: Expression;
    property: string;
}
export interface FunctionCall extends BaseNode {
    type: 'FunctionCall';
    callee: Expression;
    arguments: Expression[];
}
export interface ArrayAccess extends BaseNode {
    type: 'ArrayAccess';
    object: Expression;
    index: Expression;
}
export interface ObjectLiteral extends BaseNode {
    type: 'ObjectLiteral';
    properties: ObjectProperty[];
}
export interface ObjectProperty extends BaseNode {
    type: 'ObjectProperty';
    key: string;
    value: Expression;
}
export interface ArrayLiteral extends BaseNode {
    type: 'ArrayLiteral';
    elements: Expression[];
}
export interface RangeLiteral extends BaseNode {
    type: 'RangeLiteral';
    start: number;
    end: number;
}
export interface BinaryOperation extends BaseNode {
    type: 'BinaryOperation';
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
}
export type BinaryOperator = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=' | '&&' | '||';
export interface UnaryOperation extends BaseNode {
    type: 'UnaryOperation';
    operator: UnaryOperator;
    operand: Expression;
}
export type UnaryOperator = '+' | '-' | '!';
export interface TernaryOperation extends BaseNode {
    type: 'TernaryOperation';
    condition: Expression;
    thenExpression: Expression;
    elseExpression: Expression;
}
