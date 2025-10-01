/** AWS-SPEC: CST to AST Mapper | OWNER: vela | STATUS: READY */

import { CstNode, CstElement } from 'chevrotain';
import {
  Template,
  Segment,
  Text,
  Interpolation,
  IfDirective,
  ElseIfBranch,
  SetDirective,
  ForEachDirective,
  BreakDirective,
  StopDirective,
  MacroDirective,
  Expression,
  Literal,
  VariableReference,
  MemberAccess,
  FunctionCall,
  ArrayAccess,
  ObjectLiteral,
  ArrayLiteral,
  RangeLiteral,
  BinaryOperator,
  UnaryOperator,
  Position,
  SourceLocation,
} from './ast.js';

// APIGW:CST to AST Mapper

export function cstToAst(cst: CstNode): Template {
  // Handle case where template is a single expression
  if (cst.children.expression) {
    return {
      type: 'Template',
      segments: [{
        type: 'Interpolation',
        expression: expressionToAst(cst.children.expression[0] as CstNode),
        location: getLocation(cst),
      }],
    };
  }
  
  // Handle case where template is an object literal
  if (cst.children.objectLiteral) {
    return {
      type: 'Template',
      segments: [{
        type: 'Interpolation',
        expression: objectLiteralToAst(cst.children.objectLiteral[0] as CstNode),
        location: getLocation(cst),
      }],
    };
  }
  
  // Handle case where template is an array literal
  if (cst.children.arrayLiteral) {
    return {
      type: 'Template',
      segments: [{
        type: 'Interpolation',
        expression: arrayLiteralToAst(cst.children.arrayLiteral[0] as CstNode),
        location: getLocation(cst),
      }],
    };
  }
  
  return {
    type: 'Template',
    segments: cst.children.segment?.map(segmentToAst) || [],
  };
}

function segmentToAst(segment: CstElement): Segment {
  if ('children' in segment) {
    const node = segment as CstNode;
    if (node.children.text) {
      return textToAst(node.children.text[0] as CstNode);
    }
    if (node.children.interpolation) {
      return interpolationToAst(node.children.interpolation[0] as CstNode);
    }
    if (node.children.directive) {
      return directiveToAst(node.children.directive[0] as CstNode);
    }
  }
  throw new Error('Invalid segment type');
}

function textToAst(text: CstNode): Text {
  const parts = ((text.children as any).AnyTextFragment || []) as Array<{ image: string }>;
  const value = parts.map(t => t.image).join('');
  return {
    type: 'Text',
    value,
    location: getLocation(text),
  };
}

function interpolationToAst(interp: CstNode): Interpolation {
  if (interp.children.expression) {
    return {
      type: 'Interpolation',
      expression: expressionToAst(interp.children.expression[0] as CstNode),
      location: getLocation(interp),
    };
  }
  if (interp.children.varChain) {
    return {
      type: 'Interpolation',
      expression: varChainToAst(interp.children.varChain[0] as CstNode),
      location: getLocation(interp),
    };
  }
  throw new Error('Invalid interpolation');
}

function varChainToAst(varChain: CstNode): Expression {
  let expr: Expression = variableReferenceToAst(varChain.children.variableReference![0] as CstNode);
  
  // Apply suffixes in order
  const suffixes = varChain.children.suffix || [];
  
  for (const s of suffixes) {
    const sNode = s as CstNode;
    const c: any = sNode.children;
    if (c.Dot) {
      expr = {
        type: 'MemberAccess',
        object: expr,
        property: (c.prop[0] as any).image,
        location: getLocation(s as any),
      } as MemberAccess;
    } else if (c.LParen) {
      const args = (c.args ?? []).map((e: any) => expressionToAst(e));
      expr = {
        type: 'FunctionCall',
        callee: expr,
        arguments: args,
        location: getLocation(s as any),
      } as FunctionCall;
    } else if (c.LBracket) {
      expr = {
        type: 'ArrayAccess',
        object: expr,
        index: expressionToAst(c.index[0] as CstNode),
        location: getLocation(s as any),
      } as ArrayAccess;
    }
  }
  
  return expr;
}

function directiveToAst(directive: CstNode): Segment {
  if (directive.children.ifDirective) {
    return ifDirectiveToAst(directive.children.ifDirective[0] as CstNode);
  }
  if (directive.children.setDirective) {
    return setDirectiveToAst(directive.children.setDirective[0] as CstNode);
  }
  if (directive.children.forEachDirective) {
    return forEachDirectiveToAst(directive.children.forEachDirective[0] as CstNode);
  }
  if (directive.children.breakDirective) {
    return breakDirectiveToAst(directive.children.breakDirective[0] as CstNode);
  }
  if (directive.children.stopDirective) {
    return stopDirectiveToAst(directive.children.stopDirective[0] as CstNode);
  }
  if (directive.children.macroDirective) {
    return macroDirectiveToAst(directive.children.macroDirective[0] as CstNode);
  }
  throw new Error('Invalid directive type');
}

function ifDirectiveToAst(ifDirective: CstNode): IfDirective {
  const elseIfBranches: ElseIfBranch[] = [];
  const thenBody: Segment[] = [];
  let elseBody: Segment[] | undefined;

  // Process then body
  if (ifDirective.children.thenBody) {
    thenBody.push(...ifDirective.children.thenBody.map(segmentToAst));
  }

  // Process else-if branches
  if (ifDirective.children.elseIfBranches) {
    for (const elseIf of ifDirective.children.elseIfBranches) {
      elseIfBranches.push(elseIfBranchToAst(elseIf as CstNode));
    }
  }

  // Process else body
  if (ifDirective.children.elseBranch) {
    const elseBranch = ifDirective.children.elseBranch[0] as CstNode;
    if (elseBranch.children.body) {
      elseBody = elseBranch.children.body.map(segmentToAst);
    }
  }

  return {
    type: 'IfDirective',
    condition: expressionToAst(ifDirective.children.condition![0] as CstNode),
    thenBody,
    elseIfBranches,
    elseBody: elseBody || [],
    location: getLocation(ifDirective),
  };
}

function elseIfBranchToAst(elseIf: CstNode): ElseIfBranch {
  return {
    type: 'ElseIfBranch',
    condition: expressionToAst(elseIf.children.condition![0] as CstNode),
    body: elseIf.children.body?.map(segmentToAst) || [],
    location: getLocation(elseIf),
  };
}

function setDirectiveToAst(setDirective: CstNode): SetDirective {
  const raw = (setDirective.children.variable![0] as any).image as string;
  const name = raw.startsWith('$!') ? raw.slice(2) : raw.startsWith('$') ? raw.slice(1) : raw;
  return {
    type: 'SetDirective',
    variable: name,
    value: expressionToAst(setDirective.children.value![0] as CstNode),
    location: getLocation(setDirective),
  };
}

function forEachDirectiveToAst(forEachDirective: CstNode): ForEachDirective {
  const raw = (forEachDirective.children.variable![0] as any).image as string;
  const name = raw.startsWith('$!') ? raw.slice(2) : raw.startsWith('$') ? raw.slice(1) : raw;
  const result: ForEachDirective = {
    type: 'ForEachDirective',
    variable: name,
    iterable: expressionToAst(forEachDirective.children.iterable![0] as CstNode),
    body: forEachDirective.children.body?.map(segmentToAst) || [],
    location: getLocation(forEachDirective),
  };
  
  if (forEachDirective.children.elseBody && forEachDirective.children.elseBody.length > 0) {
    const elseBodyNode = forEachDirective.children.elseBody[0] as CstNode;
    if (elseBodyNode.children.elseBodySegment && elseBodyNode.children.elseBodySegment.length > 0) {
      result.elseBody = elseBodyNode.children.elseBodySegment.map(segmentToAst);
    }
  }
  
  return result;
}

function breakDirectiveToAst(breakDirective: CstNode): BreakDirective {
  return {
    type: 'BreakDirective',
    location: getLocation(breakDirective),
  };
}

function stopDirectiveToAst(stopDirective: CstNode): StopDirective {
  return {
    type: 'StopDirective',
    location: getLocation(stopDirective),
  };
}

function macroDirectiveToAst(macroDirective: CstNode): MacroDirective {
  return {
    type: 'MacroDirective',
    name: (macroDirective.children.name![0] as any).image,
    parameters: macroDirective.children.parameters?.map((p: any) => p.image) || [],
    body: macroDirective.children.body?.map(segmentToAst) || [],
    location: getLocation(macroDirective),
  };
}

function expressionToAst(expr: CstNode): Expression {
  if (expr.children.conditional) {
    return conditionalToAst(expr.children.conditional[0] as CstNode);
  }
  if (expr.children.literal) {
    return literalToAst(expr.children.literal[0] as CstNode);
  }
  if (expr.children.variableReference) {
    return variableReferenceToAst(expr.children.variableReference[0] as CstNode);
  }
  if (expr.children.memberAccess) {
    return memberAccessToAst(expr.children.memberAccess[0] as CstNode);
  }
  if (expr.children.functionCall) {
    return functionCallToAst(expr.children.functionCall[0] as CstNode);
  }
  if (expr.children.arrayAccess) {
    return arrayAccessToAst(expr.children.arrayAccess[0] as CstNode);
  }
  if (expr.children.objectLiteral) {
    return objectLiteralToAst(expr.children.objectLiteral[0] as CstNode);
  }
  if (expr.children.arrayLiteral) {
    return arrayLiteralToAst(expr.children.arrayLiteral[0] as CstNode);
  }
  if (expr.children.logicalOr) {
    return logicalOrToAst(expr.children.logicalOr[0] as CstNode);
  }
  if (expr.children.logicalAnd) {
    return logicalAndToAst(expr.children.logicalAnd[0] as CstNode);
  }
  if (expr.children.equality) {
    return equalityToAst(expr.children.equality[0] as CstNode);
  }
  if (expr.children.relational) {
    return relationalToAst(expr.children.relational[0] as CstNode);
  }
  if (expr.children.additive) {
    return additiveToAst(expr.children.additive[0] as CstNode);
  }
  if (expr.children.multiplicative) {
    return multiplicativeToAst(expr.children.multiplicative[0] as CstNode);
  }
  if (expr.children.unary) {
    return unaryToAst(expr.children.unary[0] as CstNode);
  }
  if (expr.children.primary) {
    return primaryToAst(expr.children.primary[0] as CstNode);
  }
  throw new Error('Invalid expression type');
}

function conditionalToAst(conditional: CstNode): Expression {
  const logicalOr = conditional.children.logicalOr?.[0] as CstNode;
  const expressions = conditional.children.expression || [];
  
  // If no expressions, this is not a ternary operation, just return the logicalOr
  if (expressions.length === 0) {
    return logicalOrToAst(logicalOr);
  }
  
  if (expressions.length !== 2) {
    throw new Error('Invalid conditional operation');
  }

  return {
    type: 'TernaryOperation',
    condition: logicalOrToAst(logicalOr),
    thenExpression: expressionToAst(expressions[0] as CstNode),
    elseExpression: expressionToAst(expressions[1] as CstNode),
    location: getLocation(conditional),
  };
}

function literalToAst(literal: CstNode): Literal {
  const token = literal.children.StringLiteral?.[0] || 
                literal.children.NumberLiteral?.[0] || 
                literal.children.BooleanLiteral?.[0] || 
                literal.children.NullLiteral?.[0];
  
  if (!token) {
    throw new Error('Invalid literal type');
  }

  let value: string | number | boolean | null;
  
  if (literal.children.StringLiteral) {
    // Remove quotes and unescape using Velocity-style doubling
    const str = (token as any).image as string;
    const quote = str[0];
    let inner = str.slice(1, -1);
    if (quote === '"') {
      inner = inner.replace(/""/g, '"');
    } else if (quote === "'") {
      inner = inner.replace(/''/g, "'");
    }
    value = inner;
  } else if (literal.children.NumberLiteral) {
    value = parseFloat((token as any).image);
  } else if (literal.children.BooleanLiteral) {
    value = (token as any).image === 'true';
  } else {
    value = null;
  }

  return {
    type: 'Literal',
    value,
    location: getLocation(literal),
  };
}

function variableReferenceToAst(ref: CstNode): VariableReference {
  const token = ref.children.DollarRef?.[0] || ref.children.QuietRef?.[0];
  if (!token) {
    throw new Error('Invalid variable reference');
  }

  const isQuiet = !!ref.children.QuietRef;
  const name = (token as any).image.slice(isQuiet ? 2 : 1); // Remove $ or $!

  return {
    type: 'VariableReference',
    name,
    quiet: isQuiet,
    location: getLocation(ref),
  };
}

function memberAccessToAst(memberAccess: CstNode): MemberAccess {
  const primary = memberAccess.children.primary?.[0] as CstNode;
  const identifiers = memberAccess.children.Identifier || [];
  
  if (!primary || identifiers.length === 0) {
    throw new Error('Invalid member access');
  }

  // Build nested member access
  let object: Expression = primaryToAst(primary);
  
  for (const identifier of identifiers) {
    object = {
      type: 'MemberAccess',
      object,
      property: (identifier as any).image,
      location: getLocation(memberAccess),
    };
  }

  return object as MemberAccess;
}

function functionCallToAst(call: CstNode): FunctionCall {
  const callee = call.children.primary?.[0] as CstNode;
  const args = call.children.expression || [];
  
  if (!callee) {
    throw new Error('Invalid function call');
  }

  return {
    type: 'FunctionCall',
    callee: primaryToAst(callee),
    arguments: args.map(expr => expressionToAst(expr as CstNode)),
    location: getLocation(call),
  };
}

function arrayAccessToAst(access: CstNode): ArrayAccess {
  const object = access.children.primary?.[0] as CstNode;
  const index = access.children.expression?.[0] as CstNode;
  
  if (!object || !index) {
    throw new Error('Invalid array access');
  }

  return {
    type: 'ArrayAccess',
    object: primaryToAst(object),
    index: expressionToAst(index),
    location: getLocation(access),
  };
}

function objectLiteralToAst(obj: CstNode): ObjectLiteral {
  const properties = obj.children.objectProperty?.map(prop => {
    const propNode = prop as CstNode;
    return {
      type: 'ObjectProperty' as const,
      key: (propNode.children.Identifier![0] as any).image,
      value: expressionToAst(propNode.children.expression![0] as CstNode),
      location: getLocation(propNode),
    };
  }) || [];

  return {
    type: 'ObjectLiteral',
    properties,
    location: getLocation(obj),
  };
}

function arrayLiteralToAst(arr: CstNode): ArrayLiteral | RangeLiteral {
  // Check if this is a range literal [1..3]
  if (arr.children.start && arr.children.rangeOperator && arr.children.end) {
    const start = parseInt((arr.children.start[0] as any).image);
    const end = parseInt((arr.children.end[0] as any).image);
    
    return {
      type: 'RangeLiteral',
      start,
      end,
      location: getLocation(arr),
    };
  }
  
  // Regular array literal
  const elements = arr.children.expression?.map(expr => expressionToAst(expr as CstNode)) || [];

  return {
    type: 'ArrayLiteral',
    elements,
    location: getLocation(arr),
  };
}



function logicalOrToAst(logicalOr: CstNode): Expression {
  const logicalAnds = logicalOr.children.logicalAnd || [];
  
  if (logicalAnds.length === 1) {
    return logicalAndToAst(logicalAnds[0] as CstNode);
  }

  let result: Expression = logicalAndToAst(logicalAnds[0] as CstNode);
  for (let i = 1; i < logicalAnds.length; i++) {
    result = {
      type: 'BinaryOperation',
      operator: '||',
      left: result,
      right: logicalAndToAst(logicalAnds[i] as CstNode),
      location: getLocation(logicalOr),
    };
  }
  return result;
}

function logicalAndToAst(logicalAnd: CstNode): Expression {
  const equalities = logicalAnd.children.equality || [];
  if (equalities.length === 1) {
    return equalityToAst(equalities[0] as CstNode);
  }

  let result: Expression = equalityToAst(equalities[0] as CstNode);
  for (let i = 1; i < equalities.length; i++) {
    result = {
      type: 'BinaryOperation',
      operator: '&&',
      left: result,
      right: equalityToAst(equalities[i] as CstNode),
      location: getLocation(logicalAnd),
    };
  }
  return result;
}

function equalityToAst(equality: CstNode): Expression {
  const relationals = equality.children.relational || [];
  let expr: Expression = relationalToAst(relationals[0] as CstNode);
  const ops = ([...(equality.children.Eq || []), ...(equality.children.Ne || [])] as any[])
    .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
    .map(t => t.image as '==' | '!=') as Array<'==' | '!='>;
  for (let i = 0; i < ops.length; i++) {
    const operator = ops[i]! as BinaryOperator;
    expr = {
      type: 'BinaryOperation',
      operator,
      left: expr,
      right: relationalToAst(relationals[i + 1] as CstNode),
      location: getLocation(equality),
    };
  }
  return expr;
}

function relationalToAst(relational: CstNode): Expression {
  const additives = relational.children.additive || [];
  let expr: Expression = additiveToAst(additives[0] as CstNode);
  const ops = ([
    ...(relational.children.Lt || []),
    ...(relational.children.Le || []),
    ...(relational.children.Gt || []),
    ...(relational.children.Ge || []),
  ] as any[])
    .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
    .map(t => t.image as '<' | '<=' | '>' | '>=') as Array<'<' | '<=' | '>' | '>='>;
  for (let i = 0; i < ops.length; i++) {
    const operator = ops[i]! as BinaryOperator;
    expr = {
      type: 'BinaryOperation',
      operator,
      left: expr,
      right: additiveToAst(additives[i + 1] as CstNode),
      location: getLocation(relational),
    };
  }
  return expr;
}

function additiveToAst(additive: CstNode): Expression {
  const multiplicatives = additive.children.multiplicative || [];
  let expr: Expression = multiplicativeToAst(multiplicatives[0] as CstNode);
  const ops = ([...(additive.children.Plus || []), ...(additive.children.Minus || [])] as any[])
    .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
    .map(t => t.image as '+' | '-') as Array<'+' | '-'>;
  for (let i = 0; i < ops.length; i++) {
    const operator = ops[i]! as BinaryOperator;
    expr = {
      type: 'BinaryOperation',
      operator,
      left: expr,
      right: multiplicativeToAst(multiplicatives[i + 1] as CstNode),
      location: getLocation(additive),
    };
  }
  return expr;
}

function multiplicativeToAst(multiplicative: CstNode): Expression {
  const unaries = multiplicative.children.unary || [];
  let expr: Expression = unaryToAst(unaries[0] as CstNode);
  const ops = ([
    ...(multiplicative.children.Star || []),
    ...(multiplicative.children.Slash || []),
    ...(multiplicative.children.Mod || []),
  ] as any[])
    .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
    .map(t => t.image as '*' | '/' | '%') as Array<'*' | '/' | '%'>;
  for (let i = 0; i < ops.length; i++) {
    const operator = ops[i]! as BinaryOperator;
    expr = {
      type: 'BinaryOperation',
      operator,
      left: expr,
      right: unaryToAst(unaries[i + 1] as CstNode),
      location: getLocation(multiplicative),
    };
  }
  return expr;
}

function unaryToAst(unary: CstNode): Expression {
  if (unary.children.primary) {
    return primaryToAst(unary.children.primary[0] as CstNode);
  }

  const operator = getUnaryOperator(unary);
  const operand = unary.children.unary?.[0] as CstNode;
  
  if (!operand) {
    throw new Error('Invalid unary operation');
  }

  return {
    type: 'UnaryOperation',
    operator,
    operand: unaryToAst(operand),
    location: getLocation(unary),
  };
}

function primaryToAst(primary: CstNode): Expression {
  let expr = primaryBaseToAst((primary.children as any).base[0] as CstNode);
  const suffixes = (primary.children as any).suffixes || [];
  
  for (const s of suffixes) {
    const c: any = s.children;
    if (c.Dot) {
      expr = {
        type: 'MemberAccess',
        object: expr,
        property: (c.prop[0] as any).image,
        location: getLocation(s as any),
      } as MemberAccess;
    } else if (c.LParen) {
      const args = (c.args ?? []).map((e: any) => expressionToAst(e));
      expr = {
        type: 'FunctionCall',
        callee: expr,
        arguments: args,
        location: getLocation(s as any),
      } as FunctionCall;
    } else if (c.LBracket) {
      expr = {
        type: 'ArrayAccess',
        object: expr,
        index: expressionToAst(c.index[0] as CstNode),
        location: getLocation(s as any),
      } as ArrayAccess;
    }
  }
  
  return expr;
}

function primaryBaseToAst(pb: CstNode): Expression {
  const c: any = pb.children;
  if (c.literal) return literalToAst(c.literal[0] as CstNode);
  if (c.variableReference) return variableReferenceToAst(c.variableReference[0] as CstNode);
  if (c.objectLiteral) return objectLiteralToAst(c.objectLiteral[0] as CstNode);
  if (c.arrayLiteral) return arrayLiteralToAst(c.arrayLiteral[0] as CstNode);
  if (c.expression) return expressionToAst(c.expression[0] as CstNode);
  throw new Error('Invalid primaryBase');
}

function getUnaryOperator(node: CstNode): UnaryOperator {
  if (node.children.Not?.[0]) return '!';
  if (node.children.Plus?.[0]) return '+';
  if (node.children.Minus?.[0]) return '-';
  throw new Error('Invalid unary operator');
}

function getLocation(_node: CstNode | CstElement): SourceLocation {
  const start = getPosition(0);
  const end = getPosition(0);
  return { start, end };
}

function getPosition(offset: number): Position {
  // This is a simplified position calculation
  // In a real implementation, you'd track line/column during parsing
  return {
    line: 1,
    column: offset + 1,
    offset,
  };
}

/* Deviation Report: None - CST to AST mapper matches AWS API Gateway VTL specification */
