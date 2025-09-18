/** AWS-SPEC: AST Types | OWNER: vela | STATUS: READY */

// APIGW:AST Types

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

// Base AST node
export interface BaseNode {
  type: string;
  location?: SourceLocation;
}

// Template structure
export interface Template extends BaseNode {
  type: 'Template';
  segments: Segment[];
}

export type Segment = Text | Interpolation | VariableReference | Directive;

// Text content
export interface Text extends BaseNode {
  type: 'Text';
  value: string;
}

// Interpolation
export interface Interpolation extends BaseNode {
  type: 'Interpolation';
  expression: Expression;
}

// Directives
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

export type Directive = 
  | IfDirective 
  | SetDirective 
  | ForEachDirective 
  | BreakDirective 
  | StopDirective 
  | MacroDirective;

// Expressions
export type Expression = 
  | Literal 
  | VariableReference 
  | MemberAccess 
  | FunctionCall 
  | ArrayAccess 
  | ObjectLiteral 
  | ArrayLiteral 
  | BinaryOperation 
  | UnaryOperation 
  | TernaryOperation;

// Literals
export interface Literal extends BaseNode {
  type: 'Literal';
  value: string | number | boolean | null;
}

// Variable references
export interface VariableReference extends BaseNode {
  type: 'VariableReference';
  name: string;
  quiet: boolean; // $!ref vs $ref
}

// Member access (a.b.c)
export interface MemberAccess extends BaseNode {
  type: 'MemberAccess';
  object: Expression;
  property: string;
}

// Function calls
export interface FunctionCall extends BaseNode {
  type: 'FunctionCall';
  callee: Expression;
  arguments: Expression[];
}

// Array access (a[0])
export interface ArrayAccess extends BaseNode {
  type: 'ArrayAccess';
  object: Expression;
  index: Expression;
}

// Object literals
export interface ObjectLiteral extends BaseNode {
  type: 'ObjectLiteral';
  properties: ObjectProperty[];
}

export interface ObjectProperty extends BaseNode {
  type: 'ObjectProperty';
  key: string;
  value: Expression;
}

// Array literals
export interface ArrayLiteral extends BaseNode {
  type: 'ArrayLiteral';
  elements: Expression[];
}


// Binary operations
export interface BinaryOperation extends BaseNode {
  type: 'BinaryOperation';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator = 
  | '+' | '-' | '*' | '/' | '%'
  | '==' | '!=' | '<' | '<=' | '>' | '>='
  | '&&' | '||';

// Unary operations
export interface UnaryOperation extends BaseNode {
  type: 'UnaryOperation';
  operator: UnaryOperator;
  operand: Expression;
}

export type UnaryOperator = '+' | '-' | '!';

// Ternary operations (condition ? then : else)
export interface TernaryOperation extends BaseNode {
  type: 'TernaryOperation';
  condition: Expression;
  thenExpression: Expression;
  elseExpression: Expression;
}

/* Deviation Report: None - AST types match AWS API Gateway VTL specification */
