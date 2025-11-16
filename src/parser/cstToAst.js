/** Apache Velocity: CST to AST Mapper | OWNER: vela | STATUS: READY */
export function cstToAst(cst) {
    // Handle case where template is a single expression
    if (cst.children.expression) {
        return {
            type: 'Template',
            segments: [{
                    type: 'Interpolation',
                    expression: expressionToAst(cst.children.expression[0]),
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
                    expression: objectLiteralToAst(cst.children.objectLiteral[0]),
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
                    expression: arrayLiteralToAst(cst.children.arrayLiteral[0]),
                    location: getLocation(cst),
                }],
        };
    }
    return {
        type: 'Template',
        segments: cst.children.segment?.map(segmentToAst) || [],
    };
}
function segmentToAst(segment) {
    if ('children' in segment) {
        const node = segment;
        if (node.children.text) {
            return textToAst(node.children.text[0]);
        }
        if (node.children.interpolation) {
            return interpolationToAst(node.children.interpolation[0]);
        }
        if (node.children.directive) {
            return directiveToAst(node.children.directive[0]);
        }
    }
    throw new Error('Invalid segment type');
}
function textToAst(text) {
    const parts = (text.children.AnyTextFragment || []);
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
function interpolationToAst(interp) {
    if (interp.children.expression) {
        return {
            type: 'Interpolation',
            expression: expressionToAst(interp.children.expression[0]),
            location: getLocation(interp),
        };
    }
    if (interp.children.varChain) {
        return {
            type: 'Interpolation',
            expression: varChainToAst(interp.children.varChain[0]),
            location: getLocation(interp),
        };
    }
    throw new Error('Invalid interpolation');
}
function varChainToAst(varChain) {
    let expr = variableReferenceToAst(varChain.children.variableReference[0]);
    // Apply suffixes in order
    const suffixes = varChain.children.suffix || [];
    for (const s of suffixes) {
        const sNode = s;
        const c = sNode.children;
        if (c.Dot) {
            expr = {
                type: 'MemberAccess',
                object: expr,
                property: c.prop[0].image,
                location: getLocation(s),
            };
        }
        else if (c.LParen) {
            const args = (c.args ?? []).map((e) => expressionToAst(e));
            expr = {
                type: 'FunctionCall',
                callee: expr,
                arguments: args,
                location: getLocation(s),
            };
        }
        else if (c.LBracket) {
            expr = {
                type: 'ArrayAccess',
                object: expr,
                index: expressionToAst(c.index[0]),
                location: getLocation(s),
            };
        }
    }
    return expr;
}
function directiveToAst(directive) {
    if (directive.children.ifDirective) {
        return ifDirectiveToAst(directive.children.ifDirective[0]);
    }
    if (directive.children.setDirective) {
        return setDirectiveToAst(directive.children.setDirective[0]);
    }
    if (directive.children.forEachDirective) {
        return forEachDirectiveToAst(directive.children.forEachDirective[0]);
    }
    if (directive.children.breakDirective) {
        return breakDirectiveToAst(directive.children.breakDirective[0]);
    }
    if (directive.children.stopDirective) {
        return stopDirectiveToAst(directive.children.stopDirective[0]);
    }
    if (directive.children.macroDirective) {
        return macroDirectiveToAst(directive.children.macroDirective[0]);
    }
    if (directive.children.evaluateDirective) {
        return evaluateDirectiveToAst(directive.children.evaluateDirective[0]);
    }
    if (directive.children.parseDirective) {
        return parseDirectiveToAst(directive.children.parseDirective[0]);
    }
    if (directive.children.includeDirective) {
        return includeDirectiveToAst(directive.children.includeDirective[0]);
    }
    throw new Error('Invalid directive type');
}
function ifDirectiveToAst(ifDirective) {
    const elseIfBranches = [];
    const thenBody = [];
    let elseBody;
    // Process then body
    if (ifDirective.children.thenBody) {
        thenBody.push(...ifDirective.children.thenBody.map(segmentToAst));
    }
    // Process else-if branches
    if (ifDirective.children.elseIfBranches) {
        for (const elseIf of ifDirective.children.elseIfBranches) {
            elseIfBranches.push(elseIfBranchToAst(elseIf));
        }
    }
    // Process else body
    if (ifDirective.children.elseBranch) {
        const elseBranch = ifDirective.children.elseBranch[0];
        if (elseBranch.children.body) {
            elseBody = elseBranch.children.body.map(segmentToAst);
        }
    }
    return {
        type: 'IfDirective',
        condition: expressionToAst(ifDirective.children.condition[0]),
        thenBody,
        elseIfBranches,
        elseBody: elseBody || [],
        location: getLocation(ifDirective),
    };
}
function elseIfBranchToAst(elseIf) {
    return {
        type: 'ElseIfBranch',
        condition: expressionToAst(elseIf.children.condition[0]),
        body: elseIf.children.body?.map(segmentToAst) || [],
        location: getLocation(elseIf),
    };
}
function setDirectiveToAst(setDirective) {
    const raw = setDirective.children.variable[0].image;
    const name = raw.startsWith('$!') ? raw.slice(2) : raw.startsWith('$') ? raw.slice(1) : raw;
    return {
        type: 'SetDirective',
        variable: name,
        value: expressionToAst(setDirective.children.value[0]),
        location: getLocation(setDirective),
    };
}
function forEachDirectiveToAst(forEachDirective) {
    const raw = forEachDirective.children.variable[0].image;
    const name = raw.startsWith('$!') ? raw.slice(2) : raw.startsWith('$') ? raw.slice(1) : raw;
    const result = {
        type: 'ForEachDirective',
        variable: name,
        iterable: expressionToAst(forEachDirective.children.iterable[0]),
        body: forEachDirective.children.body?.map(segmentToAst) || [],
        location: getLocation(forEachDirective),
    };
    if (forEachDirective.children.elseBody && forEachDirective.children.elseBody.length > 0) {
        const elseBodyNode = forEachDirective.children.elseBody[0];
        if (elseBodyNode.children.elseBodySegment && elseBodyNode.children.elseBodySegment.length > 0) {
            result.elseBody = elseBodyNode.children.elseBodySegment.map(segmentToAst);
        }
    }
    return result;
}
function breakDirectiveToAst(breakDirective) {
    return {
        type: 'BreakDirective',
        location: getLocation(breakDirective),
    };
}
function stopDirectiveToAst(stopDirective) {
    return {
        type: 'StopDirective',
        location: getLocation(stopDirective),
    };
}
function macroDirectiveToAst(macroDirective) {
    return {
        type: 'MacroDirective',
        name: macroDirective.children.name[0].image,
        parameters: macroDirective.children.parameters?.map((p) => p.image) || [],
        body: macroDirective.children.body?.map(segmentToAst) || [],
        location: getLocation(macroDirective),
    };
}
function evaluateDirectiveToAst(evaluateDirective) {
    return {
        type: 'EvaluateDirective',
        expression: expressionToAst(evaluateDirective.children.expression[0]),
        location: getLocation(evaluateDirective),
    };
}
function parseDirectiveToAst(parseDirective) {
    return {
        type: 'ParseDirective',
        expression: expressionToAst(parseDirective.children.expression[0]),
        location: getLocation(parseDirective),
    };
}
function includeDirectiveToAst(includeDirective) {
    return {
        type: 'IncludeDirective',
        expression: expressionToAst(includeDirective.children.expression[0]),
        location: getLocation(includeDirective),
    };
}
function expressionToAst(expr) {
    if (expr.children.conditional) {
        return conditionalToAst(expr.children.conditional[0]);
    }
    if (expr.children.literal) {
        return literalToAst(expr.children.literal[0]);
    }
    if (expr.children.variableReference) {
        return variableReferenceToAst(expr.children.variableReference[0]);
    }
    if (expr.children.memberAccess) {
        return memberAccessToAst(expr.children.memberAccess[0]);
    }
    if (expr.children.functionCall) {
        return functionCallToAst(expr.children.functionCall[0]);
    }
    if (expr.children.arrayAccess) {
        return arrayAccessToAst(expr.children.arrayAccess[0]);
    }
    if (expr.children.objectLiteral) {
        return objectLiteralToAst(expr.children.objectLiteral[0]);
    }
    if (expr.children.arrayLiteral) {
        return arrayLiteralToAst(expr.children.arrayLiteral[0]);
    }
    if (expr.children.logicalOr) {
        return logicalOrToAst(expr.children.logicalOr[0]);
    }
    if (expr.children.logicalAnd) {
        return logicalAndToAst(expr.children.logicalAnd[0]);
    }
    if (expr.children.equality) {
        return equalityToAst(expr.children.equality[0]);
    }
    if (expr.children.relational) {
        return relationalToAst(expr.children.relational[0]);
    }
    if (expr.children.additive) {
        return additiveToAst(expr.children.additive[0]);
    }
    if (expr.children.multiplicative) {
        return multiplicativeToAst(expr.children.multiplicative[0]);
    }
    if (expr.children.unary) {
        return unaryToAst(expr.children.unary[0]);
    }
    if (expr.children.primary) {
        return primaryToAst(expr.children.primary[0]);
    }
    throw new Error('Invalid expression type');
}
function conditionalToAst(conditional) {
    const logicalOr = conditional.children.logicalOr?.[0];
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
        thenExpression: expressionToAst(expressions[0]),
        elseExpression: expressionToAst(expressions[1]),
        location: getLocation(conditional),
    };
}
function literalToAst(literal) {
    const token = literal.children.StringLiteral?.[0] ||
        literal.children.NumberLiteral?.[0] ||
        literal.children.BooleanLiteral?.[0] ||
        literal.children.NullLiteral?.[0];
    if (!token) {
        throw new Error('Invalid literal type');
    }
    let value;
    if (literal.children.StringLiteral) {
        // Remove quotes and unescape
        const str = token.image;
        value = str.slice(1, -1).replace(/\\(.)/g, '$1');
    }
    else if (literal.children.NumberLiteral) {
        value = parseFloat(token.image);
    }
    else if (literal.children.BooleanLiteral) {
        value = token.image === 'true';
    }
    else {
        value = null;
    }
    return {
        type: 'Literal',
        value,
        location: getLocation(literal),
    };
}
function variableReferenceToAst(ref) {
    const token = ref.children.DollarRef?.[0] || ref.children.QuietRef?.[0];
    if (!token) {
        throw new Error('Invalid variable reference');
    }
    const isQuiet = !!ref.children.QuietRef;
    const name = token.image.slice(isQuiet ? 2 : 1); // Remove $ or $!
    return {
        type: 'VariableReference',
        name,
        quiet: isQuiet,
        location: getLocation(ref),
    };
}
function memberAccessToAst(memberAccess) {
    const primary = memberAccess.children.primary?.[0];
    const identifiers = memberAccess.children.Identifier || [];
    if (!primary || identifiers.length === 0) {
        throw new Error('Invalid member access');
    }
    // Build nested member access
    let object = primaryToAst(primary);
    for (const identifier of identifiers) {
        object = {
            type: 'MemberAccess',
            object,
            property: identifier.image,
            location: getLocation(memberAccess),
        };
    }
    return object;
}
function functionCallToAst(call) {
    const callee = call.children.primary?.[0];
    const args = call.children.expression || [];
    if (!callee) {
        throw new Error('Invalid function call');
    }
    return {
        type: 'FunctionCall',
        callee: primaryToAst(callee),
        arguments: args.map(expr => expressionToAst(expr)),
        location: getLocation(call),
    };
}
function arrayAccessToAst(access) {
    const object = access.children.primary?.[0];
    const index = access.children.expression?.[0];
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
function objectLiteralToAst(obj) {
    const properties = obj.children.objectProperty?.map(prop => {
        const propNode = prop;
        return {
            type: 'ObjectProperty',
            key: propNode.children.Identifier[0].image,
            value: expressionToAst(propNode.children.expression[0]),
            location: getLocation(propNode),
        };
    }) || [];
    return {
        type: 'ObjectLiteral',
        properties,
        location: getLocation(obj),
    };
}
function arrayLiteralToAst(arr) {
    // Check if this is a range literal [1..3]
    if (arr.children.start && arr.children.rangeOperator && arr.children.end) {
        const start = parseInt(arr.children.start[0].image);
        const end = parseInt(arr.children.end[0].image);
        return {
            type: 'RangeLiteral',
            start,
            end,
            location: getLocation(arr),
        };
    }
    // Regular array literal
    const elements = arr.children.expression?.map(expr => expressionToAst(expr)) || [];
    return {
        type: 'ArrayLiteral',
        elements,
        location: getLocation(arr),
    };
}
function logicalOrToAst(logicalOr) {
    const logicalAnds = logicalOr.children.logicalAnd || [];
    if (logicalAnds.length === 1) {
        return logicalAndToAst(logicalAnds[0]);
    }
    let result = logicalAndToAst(logicalAnds[0]);
    for (let i = 1; i < logicalAnds.length; i++) {
        result = {
            type: 'BinaryOperation',
            operator: '||',
            left: result,
            right: logicalAndToAst(logicalAnds[i]),
            location: getLocation(logicalOr),
        };
    }
    return result;
}
function logicalAndToAst(logicalAnd) {
    const equalities = logicalAnd.children.equality || [];
    if (equalities.length === 1) {
        return equalityToAst(equalities[0]);
    }
    let result = equalityToAst(equalities[0]);
    for (let i = 1; i < equalities.length; i++) {
        result = {
            type: 'BinaryOperation',
            operator: '&&',
            left: result,
            right: equalityToAst(equalities[i]),
            location: getLocation(logicalAnd),
        };
    }
    return result;
}
function equalityToAst(equality) {
    const relationals = equality.children.relational || [];
    let expr = relationalToAst(relationals[0]);
    const ops = [...(equality.children.Eq || []), ...(equality.children.Ne || [])]
        .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
        .map(t => t.image);
    for (let i = 0; i < ops.length; i++) {
        const operator = ops[i];
        expr = {
            type: 'BinaryOperation',
            operator,
            left: expr,
            right: relationalToAst(relationals[i + 1]),
            location: getLocation(equality),
        };
    }
    return expr;
}
function relationalToAst(relational) {
    const additives = relational.children.additive || [];
    let expr = additiveToAst(additives[0]);
    const ops = [
        ...(relational.children.Lt || []),
        ...(relational.children.Le || []),
        ...(relational.children.Gt || []),
        ...(relational.children.Ge || []),
    ]
        .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
        .map(t => t.image);
    for (let i = 0; i < ops.length; i++) {
        const operator = ops[i];
        expr = {
            type: 'BinaryOperation',
            operator,
            left: expr,
            right: additiveToAst(additives[i + 1]),
            location: getLocation(relational),
        };
    }
    return expr;
}
function additiveToAst(additive) {
    const multiplicatives = additive.children.multiplicative || [];
    let expr = multiplicativeToAst(multiplicatives[0]);
    const ops = [...(additive.children.Plus || []), ...(additive.children.Minus || [])]
        .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
        .map(t => t.image);
    for (let i = 0; i < ops.length; i++) {
        const operator = ops[i];
        expr = {
            type: 'BinaryOperation',
            operator,
            left: expr,
            right: multiplicativeToAst(multiplicatives[i + 1]),
            location: getLocation(additive),
        };
    }
    return expr;
}
function multiplicativeToAst(multiplicative) {
    const unaries = multiplicative.children.unary || [];
    let expr = unaryToAst(unaries[0]);
    const ops = [
        ...(multiplicative.children.Star || []),
        ...(multiplicative.children.Slash || []),
        ...(multiplicative.children.Mod || []),
    ]
        .sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
        .map(t => t.image);
    for (let i = 0; i < ops.length; i++) {
        const operator = ops[i];
        expr = {
            type: 'BinaryOperation',
            operator,
            left: expr,
            right: unaryToAst(unaries[i + 1]),
            location: getLocation(multiplicative),
        };
    }
    return expr;
}
function unaryToAst(unary) {
    if (unary.children.primary) {
        return primaryToAst(unary.children.primary[0]);
    }
    const operator = getUnaryOperator(unary);
    const operand = unary.children.unary?.[0];
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
function primaryToAst(primary) {
    let expr = primaryBaseToAst(primary.children.base[0]);
    const suffixes = primary.children.suffixes || [];
    for (const s of suffixes) {
        const c = s.children;
        if (c.Dot) {
            expr = {
                type: 'MemberAccess',
                object: expr,
                property: c.prop[0].image,
                location: getLocation(s),
            };
        }
        else if (c.LParen) {
            const args = (c.args ?? []).map((e) => expressionToAst(e));
            expr = {
                type: 'FunctionCall',
                callee: expr,
                arguments: args,
                location: getLocation(s),
            };
        }
        else if (c.LBracket) {
            expr = {
                type: 'ArrayAccess',
                object: expr,
                index: expressionToAst(c.index[0]),
                location: getLocation(s),
            };
        }
    }
    return expr;
}
function primaryBaseToAst(pb) {
    const c = pb.children;
    if (c.literal)
        return literalToAst(c.literal[0]);
    if (c.variableReference)
        return variableReferenceToAst(c.variableReference[0]);
    if (c.objectLiteral)
        return objectLiteralToAst(c.objectLiteral[0]);
    if (c.arrayLiteral)
        return arrayLiteralToAst(c.arrayLiteral[0]);
    if (c.expression)
        return expressionToAst(c.expression[0]);
    throw new Error('Invalid primaryBase');
}
function getUnaryOperator(node) {
    if (node.children.Not?.[0])
        return '!';
    if (node.children.Plus?.[0])
        return '+';
    if (node.children.Minus?.[0])
        return '-';
    throw new Error('Invalid unary operator');
}
function getLocation(_node) {
    const start = getPosition(0);
    const end = getPosition(0);
    return { start, end };
}
function getPosition(offset) {
    // This is a simplified position calculation
    // In a real implementation, you'd track line/column during parsing
    return {
        line: 1,
        column: offset + 1,
        offset,
    };
}
