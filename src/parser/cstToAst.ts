/** Apache Velocity: CST to AST Mapper | OWNER: vela | STATUS: READY */

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
  EvaluateDirective,
  ParseDirective,
  IncludeDirective,
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

export type SpaceGobblingMode = 'none' | 'bc' | 'lines' | 'structured';

export function cstToAst(cst: CstNode, spaceGobbling: SpaceGobblingMode = 'lines'): Template {
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

  const segments = cst.children.segment?.map(segmentToAst) || [];

  // CRITICAL: Extract prefix/postfix from adjacent Text segments BEFORE space gobbling
  // This matches Java Parser.jjt behavior (lines 1790-2040)
  const segmentsWithWhitespace = extractPrefixPostfix(segments);

  // Apply space gobbling based on mode
  return {
    type: 'Template',
    segments: applySpaceGobbling(segmentsWithWhitespace, spaceGobbling),
  };
}

/**
 * Extract whitespace from adjacent Text segments and attach as prefix/postfix to directives.
 * This implements the Java Parser.jjt behavior (lines 1790-2040) where whitespace around
 * directives is captured during parsing and stored on the AST nodes.
 *
 * Algorithm:
 * 1. Iterate through segments
 * 2. For each directive, check if previous/next segments are Text with only whitespace
 * 3. Extract that whitespace as prefix/postfix
 * 4. Remove or trim the Text segments accordingly
 *
 * Reference: Java ASTDirective.java:62-63, ASTIfStatement.java:46-47
 */
function extractPrefixPostfix(segments: Segment[]): Segment[] {
  const result: Segment[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue; // Safety check

    const prevSegment = i > 0 ? segments[i - 1] : null;
    const nextSegment = i < segments.length - 1 ? segments[i + 1] : null;

    // Check if this is a directive (not interpolation or text)
    const isDirective = segment.type !== 'Text' && segment.type !== 'Interpolation' &&
                        segment.type !== 'VariableReference';

    if (isDirective) {
      // Check if there's content before this directive on the same line
      // This is used later to determine if postfix should be gobbled
      // A directive is NOT on a directive-only line if there's content before it on the same line
      // If previous segment ends with newline, the directive is on a new line
      const prevInResult = result[result.length - 1];
      const hasContentBefore = prevInResult &&
                              prevInResult.type !== 'Text' ||
                              (prevInResult && prevInResult.type === 'Text' &&
                               !prevInResult.value.match(/\r?\n$/) &&
                               prevInResult.value.length > 0);
      if (hasContentBefore) {
        (segment as any).hasContentBefore = true;
      }

      // Extract prefix from previous Text segment if it ends with whitespace
      // Skip for MacroDirective - preserve blank lines before macro definitions
      const isMacroDirective = segment.type === 'MacroDirective';
      if (!isMacroDirective && prevSegment && prevSegment.type === 'Text') {
        const text = prevSegment.value;
        // Match trailing whitespace (spaces, tabs, newlines)
        // Capture indentation before directive: matches whitespace after last newline
        const prefixMatch = text.match(/(?:^|\n)([ \t]*)$/);
        if (prefixMatch && prefixMatch[1]) {
          (segment as any).prefix = prefixMatch[1];
          // Remove the prefix from the previous Text segment
          const newValue = text.slice(0, -prefixMatch[1].length);
          if (newValue.length > 0) {
            (prevSegment as Text).value = newValue;
          } else {
            // Remove empty Text segment
            result.pop();
          }
        }
        // Do NOT extract newline-only Text segments as prefix
        // Newlines should be preserved in the output, only indentation (spaces/tabs) is prefix
      }

      // Extract postfix from next Text segment if it starts with whitespace/newline
      if (nextSegment && nextSegment.type === 'Text') {
        const text = nextSegment.value;
        // Match leading whitespace + newline (this is what gets gobbled)
        // Java Parser.jjt line 1932: ( [ ( t = <WHITESPACE> ) ] ( u = <NEWLINE> ) )
        // Only extract if there's a newline - whitespace alone is NOT postfix
        const postfixMatch = text.match(/^([ \t]*\r?\n)/);
        if (postfixMatch && postfixMatch[1]) {
          (segment as any).postfix = postfixMatch[1];
          // Remove the postfix from the next Text segment
          const newValue = text.slice(postfixMatch[1].length);
          (nextSegment as Text).value = newValue;
          // Don't add it yet - it will be added when we reach it in the loop
        }
        // NOTE: We do NOT extract trailing whitespace without a newline
        // Example: "#set($x = 1) text" - the space before "text" is NOT postfix
      }

      result.push(segment);
    } else {
      // Not a directive - just add it (unless it was already removed as prefix/postfix)
      if (segment.type === 'Text' && (segment as Text).value.length > 0) {
        result.push(segment);
      } else if (segment.type !== 'Text') {
        result.push(segment);
      }
    }
  }

  return result;
}

/**
 * Apply space gobbling rules recursively based on mode
 * Modes:
 * - none: No space gobbling at all
 * - bc: Backward compatibility - only gobbles for directives with parentheses
 * - lines: Line directives gobble trailing newlines when on their own line
 * - structured: Advanced gobbling for structured templates
 */
function applySpaceGobbling(segments: Segment[], mode: SpaceGobblingMode): Segment[] {
  // If mode is 'none', return segments as-is
  if (mode === 'none') {
    return segments;
  }
  // First, recursively process directive bodies to apply space gobbling within them
  const processedSegments = segments.map(segment => {
    if (segment.type === 'IfDirective') {
      const processed: IfDirective = {
        ...segment,
        thenBody: stripLeadingNewline(applySpaceGobbling(segment.thenBody, mode)), // Recursive!
        elseIfBranches: segment.elseIfBranches.map(branch => ({
          ...branch,
          body: stripLeadingNewline(applySpaceGobbling(branch.body, mode)), // Recursive!
        })),
      };
      if (segment.elseBody) {
        processed.elseBody = stripLeadingNewline(applySpaceGobbling(segment.elseBody, mode)); // Recursive!
      }
      return processed;
    } else if (segment.type === 'ForEachDirective') {
      const processed: ForEachDirective = {
        ...segment,
        body: stripLeadingNewline(applySpaceGobbling(segment.body, mode)), // Recursive!
      };
      if (segment.elseBody) {
        processed.elseBody = stripLeadingNewline(applySpaceGobbling(segment.elseBody, mode)); // Recursive!
      }
      return processed;
    } else if (segment.type === 'MacroDirective') {
      return {
        ...segment,
        body: stripLeadingNewline(applySpaceGobbling(segment.body, mode)), // Recursive!
      } as MacroDirective;
    }
    return segment;
  });
  
  // Then, process top-level segments to remove trailing newlines after directives
  // AND remove leading whitespace before directives (space gobbling in "lines" mode)
  const result: Segment[] = [];
  let lastWasDirectiveThatGobbled = false; // Track if last directive gobbled a newline

  for (let i = 0; i < processedSegments.length; i++) {
    const segment = processedSegments[i];
    if (!segment) continue;

    const nextSegment = processedSegments[i + 1];

    // Check if current segment is a block directive
    const isBlockDirective =
      segment.type === 'IfDirective' ||
      segment.type === 'ForEachDirective';
      // Note: MacroDirective is NOT included because macro definitions don't output anything
      // and should not affect spacing around them (like comments)

    // Check if current segment is a line directive that gobbles trailing newlines
    // Per Java Parser.jjt line 1931: In "lines" mode, line directives gobble trailing newlines
    // Line directives: #set, #evaluate, #parse, #include, #break, #stop
    const isLineDirectiveWithGobbling =
      segment.type === 'SetDirective' ||
      segment.type === 'EvaluateDirective' ||
      segment.type === 'ParseDirective' ||
      segment.type === 'IncludeDirective' ||
      segment.type === 'BreakDirective' ||
      segment.type === 'StopDirective';

    const isDirective = isBlockDirective || isLineDirectiveWithGobbling;

    // Check if prev segment ended with newline (or is start of template)
    // Also check if previous directive gobbled a newline (meaning current directive starts on new line)
    const prevSegment = result[result.length - 1];
    const prevEndsWithNewline = !prevSegment ||
      (prevSegment.type === 'Text' && prevSegment.value.endsWith('\n')) ||
      lastWasDirectiveThatGobbled;

    // LEADING WHITESPACE GOBBLING:
    // If this is NOT a directive but previous segment ended with newline and next segment is a directive,
    // check if current segment is text that is only whitespace before the directive
    // In "lines" mode, whitespace-only lines before directives are gobbled
    const nextIsDirective = nextSegment && (
      nextSegment.type === 'IfDirective' ||
      nextSegment.type === 'ForEachDirective' ||
      // Note: MacroDirective is NOT included - whitespace before macro definitions is preserved
      nextSegment.type === 'SetDirective' ||
      nextSegment.type === 'EvaluateDirective' ||
      nextSegment.type === 'ParseDirective' ||
      nextSegment.type === 'IncludeDirective' ||
      nextSegment.type === 'BreakDirective' ||
      nextSegment.type === 'StopDirective'
    );

    if (segment.type === 'Text' && prevEndsWithNewline && nextIsDirective) {
      // This text segment might be whitespace before a directive
      // Check if it's only whitespace (spaces/tabs, no content)
      const text = segment.value;
      if (/^[ \t]+$/.test(text)) {
        // This is whitespace-only, skip it (gobble it)
        continue;
      }
    }

    result.push(segment);
    lastWasDirectiveThatGobbled = false; // Reset for this iteration

    // TRAILING NEWLINE GOBBLING:
    // If block directive starts on new line, gobble trailing newline from next text segment
    // Also applies to certain line directives (#evaluate, #parse, #include)
    if (isDirective && prevEndsWithNewline && nextSegment?.type === 'Text') {
      const text = nextSegment.value;
      if (text.startsWith('\n')) {
        // Remove the leading newline
        const remainingText = text.substring(1);
        // Only push the segment if there's remaining text (skip if it was just a newline)
        if (remainingText.length > 0) {
          result.push({
            ...nextSegment,
            value: remainingText,
          });
        }
        i++; // Skip the next segment since we already processed it
        lastWasDirectiveThatGobbled = true; // Mark that this directive gobbled a newline
      }
    }
  }

  return result;
}

/**
 * Remove leading newline from a segment array if the first segment is text starting with newline
 */
function stripLeadingNewline(segments: Segment[]): Segment[] {
  if (segments.length === 0) return segments;
  
  const first = segments[0];
  if (first?.type === 'Text' && first.value.startsWith('\n')) {
    return [
      { ...first, value: first.value.substring(1) },
      ...segments.slice(1),
    ];
  }
  
  return segments;
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
  const value = parts.map(t => {
    // Handle escaped directives: \#end -> #end, \\#end -> \#end, etc.
    // Pattern matches the Java behavior from Parser.jjt escapedDirective method
    const image = t.image;
    const escapedDirectiveMatch = image.match(/^((?:\\\\)*)\\(#(?:if|elseif|else|end|set|foreach|break|stop|macro|evaluate|parse|include)\b)/);
    if (escapedDirectiveMatch && escapedDirectiveMatch[1] !== undefined && escapedDirectiveMatch[2] !== undefined) {
      // Count the number of double-escapes (\\) before the \#
      const doubleEscapes = escapedDirectiveMatch[1];
      const directive = escapedDirectiveMatch[2];
      // For each \\ pair, output one \
      // Then output the directive without the escape backslash
      const escapedBackslashes = doubleEscapes.replace(/\\\\/g, '\\');
      return escapedBackslashes + directive;
    }
    return image;
  }).join('');
  return {
    type: 'Text',
    value,
    location: getLocation(text),
  };
}

function interpolationToAst(interp: CstNode): Interpolation {
  if (interp.children.varChain) {
    return {
      type: 'Interpolation',
      expression: varChainToAst(interp.children.varChain[0] as CstNode),
      location: getLocation(interp),
    };
  }
  if (interp.children.bareVarChain) {
    return {
      type: 'Interpolation',
      expression: bareVarChainToAst(interp.children.bareVarChain[0] as CstNode),
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

function bareVarChainToAst(bareVarChain: CstNode): Expression {
  // Start with the base identifier
  const baseToken = (bareVarChain.children.base![0] as any).image;
  let expr: Expression = {
    type: 'VariableReference',
    name: baseToken,
    location: getLocation(bareVarChain),
  } as VariableReference;

  // Apply suffixes in order (same as varChainToAst)
  const suffixes = bareVarChain.children.suffix || [];

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
  if (directive.children.macroInvocation) {
    return macroInvocationToAst(directive.children.macroInvocation[0] as CstNode);
  }
  if (directive.children.evaluateDirective) {
    return evaluateDirectiveToAst(directive.children.evaluateDirective[0] as CstNode);
  }
  if (directive.children.parseDirective) {
    return parseDirectiveToAst(directive.children.parseDirective[0] as CstNode);
  }
  if (directive.children.includeDirective) {
    return includeDirectiveToAst(directive.children.includeDirective[0] as CstNode);
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

function macroInvocationToAst(macroInvocation: CstNode): any {
  return {
    type: 'MacroInvocation',
    name: (macroInvocation.children.name![0] as any).image,
    arguments: macroInvocation.children.arguments?.map((arg: any) => expressionToAst(arg)) || [],
    location: getLocation(macroInvocation),
  };
}

function evaluateDirectiveToAst(evaluateDirective: CstNode): EvaluateDirective {
  return {
    type: 'EvaluateDirective',
    expression: expressionToAst(evaluateDirective.children.expression![0] as CstNode),
    location: getLocation(evaluateDirective),
  };
}

function parseDirectiveToAst(parseDirective: CstNode): ParseDirective {
  return {
    type: 'ParseDirective',
    expression: expressionToAst(parseDirective.children.expression![0] as CstNode),
    location: getLocation(parseDirective),
  };
}

function includeDirectiveToAst(includeDirective: CstNode): IncludeDirective {
  return {
    type: 'IncludeDirective',
    expression: expressionToAst(includeDirective.children.expression![0] as CstNode),
    location: getLocation(includeDirective),
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
    // Check if double-quoted or single-quoted
    const str = (token as any).image;
    const isDoubleQuoted = str.startsWith('"');
    const rawValue = str.slice(1, -1); // Remove quotes
    // Unescape: \n \t etc. and escaped quotes
    value = rawValue.replace(/\\(.)/g, '$1');
    
    return {
      type: 'Literal',
      value,
      isDoubleQuoted,
      rawValue, // Keep raw value for interpolation
      location: getLocation(literal),
    };
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

