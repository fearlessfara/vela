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

// Base AST node
export interface BaseNode {
  type: string;
  location?: SourceLocation;
  // Whitespace handling for space gobbling modes (matching Java implementation)
  // prefix: whitespace/indentation BEFORE the directive
  // postfix: whitespace/newline AFTER the directive
  prefix?: string;
  postfix?: string;
}

// Template structure
export interface Template extends BaseNode {
  type: 'Template';
  segments: Segment[];
}

export type Segment = Text | Interpolation | VariableReference | Directive;

// Text content
// Note: Text nodes don't use prefix/postfix - they represent literal content
export interface Text extends BaseNode {
  type: 'Text';
  value: string;
  // Space gobbling: if true, leading newline should be stripped in certain contexts
  gobbleLeadingNewline?: boolean;
}

// Interpolation
export interface Interpolation extends BaseNode {
  type: 'Interpolation';
  expression: Expression;
  braced?: boolean; // true if ${...} syntax, false/undefined if $var syntax
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

export interface MacroInvocation extends BaseNode {
  type: 'MacroInvocation';
  name: string;
  arguments: Expression[];
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

export type Directive =
  | IfDirective
  | SetDirective
  | ForEachDirective
  | BreakDirective
  | StopDirective
  | MacroDirective
  | MacroInvocation
  | EvaluateDirective
  | ParseDirective
  | IncludeDirective;

// Expressions
export type Expression = 
  | Literal 
  | VariableReference 
  | MemberAccess 
  | FunctionCall 
  | ArrayAccess 
  | ObjectLiteral 
  | ArrayLiteral 
  | RangeLiteral
  | BinaryOperation 
  | UnaryOperation 
  | TernaryOperation;

// Literals
export interface Literal extends BaseNode {
  type: 'Literal';
  value: string | number | boolean | null;
  // For string literals: track if it's double-quoted (needs interpolation) or single-quoted (literal)
  isDoubleQuoted?: boolean;
  // Store raw string before processing (for interpolation)
  rawValue?: string;
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

// Range literals [1..3]
export interface RangeLiteral extends BaseNode {
  type: 'RangeLiteral';
  start: number;
  end: number;
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

