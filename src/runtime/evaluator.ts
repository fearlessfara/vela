/** Apache Velocity: Runtime Evaluator | OWNER: vela | STATUS: READY */

import { ScopeManager } from './scope.js';
import { StringBuilder } from './stringBuilder.js';
import { VtlParser } from '../parser/vtlParser.js';
import { cstToAst } from '../parser/cstToAst.js';
import {
  Template,
  Segment,
  Text,
  Interpolation,
  IfDirective,
  SetDirective,
  ForEachDirective,
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
  BinaryOperation,
  UnaryOperation,
  TernaryOperation,
} from '../parser/ast.js';

export type EvaluationContext = Map<string, any> | Record<string, any>;
export type SpaceGobblingMode = 'none' | 'bc' | 'lines' | 'structured';

export class VtlEvaluator {
  private scopeManager: ScopeManager;
  private stringBuilder: StringBuilder;
  private context: EvaluationContext;
  private shouldStop: boolean;
  private shouldBreak: boolean;
  private spaceGobbling: SpaceGobblingMode;

  constructor(context: EvaluationContext, spaceGobbling: SpaceGobblingMode = 'lines') {
    this.scopeManager = new ScopeManager();
    this.stringBuilder = new StringBuilder();
    this.context = context;
    this.shouldStop = false;
    this.shouldBreak = false;
    this.spaceGobbling = spaceGobbling;
  }

  evaluateTemplate(template: Template): string {
    this.stringBuilder.clear();
    this.shouldStop = false;
    this.shouldBreak = false;

    this.scopeManager.clear();
    this.initializeGlobalScope();

    for (const segment of template.segments) {
      if (this.shouldStop) {
        break;
      }
      this.evaluateSegment(segment);
    }

    return this.stringBuilder.flush();
  }

  private evaluateSegment(segment: Segment): void {
    if (this.shouldStop) {
      return;
    }

    switch (segment.type) {
      case 'Text':
        this.evaluateText(segment);
        break;
      case 'Interpolation':
        this.evaluateInterpolation(segment);
        break;
      case 'IfDirective':
        this.evaluateIfDirective(segment);
        break;
      case 'SetDirective':
        this.evaluateSetDirective(segment);
        break;
      case 'ForEachDirective':
        this.evaluateForEachDirective(segment);
        break;
      case 'BreakDirective':
        this.evaluateBreakDirective(segment);
        break;
      case 'StopDirective':
        this.evaluateStopDirective(segment);
        break;
      case 'MacroDirective':
        this.evaluateMacroDirective(segment);
        break;
      case 'EvaluateDirective':
        this.evaluateEvaluateDirective(segment);
        break;
      case 'ParseDirective':
        this.evaluateParseDirective(segment);
        break;
      case 'IncludeDirective':
        this.evaluateIncludeDirective(segment);
        break;
    }
  }

  private evaluateText(text: Text): void {
    this.stringBuilder.appendString(text.value);
  }

  private evaluateInterpolation(interp: Interpolation): void {
    const value = this.evaluateExpression(interp.expression);
    // If it's a simple variable reference that's null, output the literal variable name
    if (value === null && interp.expression.type === 'VariableReference') {
      const varRef = interp.expression as VariableReference;
      this.stringBuilder.appendString('$' + (varRef.quiet ? '!' : '') + varRef.name);
      return;
    }
    this.appendInterpolatedValue(value);
  }

  /**
   * Write prefix for directive based on space gobbling mode
   * Reference: Java ASTDirective.java:294-296
   * Logic: if (morePrefix.length() > 0 || spaceGobbling.compareTo(SpaceGobbling.LINES) < 0)
   */
  private writePrefix(segment: Segment): void {
    if (!segment.prefix) return;

    // spaceGobbling < LINES means NONE or BC
    // In these modes, prefix is written
    // In LINES and STRUCTURED modes, prefix is gobbled (represents indentation before directive)
    if (this.spaceGobbling === 'none' || this.spaceGobbling === 'bc') {
      this.stringBuilder.append(segment.prefix);
    }
  }

  /**
   * Write postfix for directive based on space gobbling mode
   * Reference: Java ASTDirective.java:311-314
   * Logic: if (morePrefix.length() > 0 || spaceGobbling == SpaceGobbling.NONE)
   */
  private writePostfix(segment: Segment): void {
    if (!segment.postfix) return;

    // Only NONE mode writes postfix
    // BC, LINES, and STRUCTURED all gobble the postfix (trailing whitespace/newline)
    if (this.spaceGobbling === 'none') {
      this.stringBuilder.append(segment.postfix);
    }
  }

  private evaluateIfDirective(ifDirective: IfDirective): void {
    // Write prefix before directive based on gobbling mode
    this.writePrefix(ifDirective);

    const condition = this.evaluateExpression(ifDirective.condition);

    if (isTruthy(condition)) {
      for (const segment of ifDirective.thenBody) {
        this.evaluateSegment(segment);
      }
    } else {
      // Check else-if branches
      let matched = false;
      for (const elseIf of ifDirective.elseIfBranches) {
        if (isTruthy(this.evaluateExpression(elseIf.condition))) {
          for (const segment of elseIf.body) {
            this.evaluateSegment(segment);
          }
          matched = true;
          break;
        }
      }

      // Check else branch
      if (!matched && ifDirective.elseBody) {
        for (const segment of ifDirective.elseBody) {
          this.evaluateSegment(segment);
        }
      }
    }

    // Write postfix after directive based on gobbling mode
    this.writePostfix(ifDirective);
  }

  private evaluateSetDirective(setDirective: SetDirective): void {
    // Write prefix before directive
    this.writePrefix(setDirective);

    const value = this.evaluateExpression(setDirective.value);
    this.scopeManager.setVariable(setDirective.variable, value);

    // Write postfix after directive
    this.writePostfix(setDirective);
  }

  private evaluateForEachDirective(forEachDirective: ForEachDirective): void {
    // Write prefix before directive
    this.writePrefix(forEachDirective);

    const iterable = this.evaluateExpression(forEachDirective.iterable);

    if (!isIterable(iterable)) {
      // If not iterable and there's an else clause, execute it
      if (forEachDirective.elseBody && forEachDirective.elseBody.length > 0) {
        for (const segment of forEachDirective.elseBody) {
          this.evaluateSegment(segment);
        }
      }
      // Write postfix after directive
      this.writePostfix(forEachDirective);
      return;
    }

    // Convert to array to get length and index information
    const items = Array.from(iterable);
    const totalItems = items.length;

    // If empty and there's an else clause, execute it
    if (totalItems === 0 && forEachDirective.elseBody && forEachDirective.elseBody.length > 0) {
      for (const segment of forEachDirective.elseBody) {
        this.evaluateSegment(segment);
      }
      // Write postfix after directive
      this.writePostfix(forEachDirective);
      return;
    }

    this.scopeManager.pushScope();

    try {
      for (let index = 0; index < items.length; index++) {
        if (this.shouldStop || this.shouldBreak) {
          break;
        }

        const item = items[index];
        const count = index + 1; // 1-based count
        const isFirst = index === 0;
        const isLast = index === totalItems - 1;
        const hasNext = index < totalItems - 1;

        // Create the $foreach object with loop control properties
        const foreachObject = {
          index: index,        // 0-based index
          count: count,        // 1-based count
          first: isFirst,      // boolean
          last: isLast,        // boolean
          hasNext: hasNext,    // boolean
          stop: () => {        // method to exit the loop
            this.shouldBreak = true;
          }
        };

        // Set both the loop variable and the $foreach object
        this.scopeManager.setVariable(forEachDirective.variable, item);
        this.scopeManager.setVariable('foreach', foreachObject);

        for (const segment of forEachDirective.body) {
          this.evaluateSegment(segment);
        }
      }
    } finally {
      this.scopeManager.popScope();
      this.shouldBreak = false;
    }

    // Write postfix after directive
    this.writePostfix(forEachDirective);
  }

  private evaluateBreakDirective(breakDirective: Segment): void {
    // Write prefix/postfix for break directive
    this.writePrefix(breakDirective);
    this.shouldBreak = true;
    this.writePostfix(breakDirective);
  }

  private evaluateStopDirective(stopDirective: Segment): void {
    // Write prefix/postfix for stop directive
    this.writePrefix(stopDirective);
    this.shouldStop = true;
    this.writePostfix(stopDirective);
  }

  private evaluateMacroDirective(macroDirective: any): void {
    // Write prefix/postfix for macro directive
    this.writePrefix(macroDirective);
    // Stub implementation - macros not yet supported
    this.scopeManager.defineMacro(
      macroDirective.name,
      macroDirective.parameters,
      macroDirective.body
    );
    this.writePostfix(macroDirective);
  }

  private evaluateEvaluateDirective(evaluateDirective: EvaluateDirective): void {
    // Write prefix before directive
    this.writePrefix(evaluateDirective);
    // #evaluate evaluates a string expression as a template
    const expressionValue = this.evaluateExpression(evaluateDirective.expression);
    const templateString = String(expressionValue);
    
    if (!templateString) {
      return;
    }
    
    // Parse and evaluate the template string
    try {
      const parser = new VtlParser();
      const parseResult = parser.parse(templateString);
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        // Silently fail for now
        return;
      }
      
      if (parseResult.cst) {
        const ast = cstToAst(parseResult.cst, this.spaceGobbling);
        // Evaluate in current scope context - create sub-evaluator that shares scope
        const subEvaluator = new VtlEvaluator(this.context, this.spaceGobbling);
        // Share the scope manager and string builder so variables are accessible
        // and output goes to the same place
        (subEvaluator as any).scopeManager = this.scopeManager;
        (subEvaluator as any).stringBuilder = this.stringBuilder;
        // Don't call evaluateTemplate as it clears the string builder
        // Instead, evaluate segments directly
        for (const segment of ast.segments) {
          if ((subEvaluator as any).shouldStop) {
            break;
          }
          (subEvaluator as any).evaluateSegment(segment);
        }
      }
    } catch (error) {
      // Silently fail on evaluation errors
    }

    // Write postfix after directive
    this.writePostfix(evaluateDirective);
  }

  private evaluateParseDirective(parseDirective: ParseDirective): void {
    // Write prefix/postfix
    this.writePrefix(parseDirective);
    // #parse includes and evaluates another template file
    // For now, not implemented (requires file system access)
    // This would need a resource loader
    this.writePostfix(parseDirective);
  }

  private evaluateIncludeDirective(includeDirective: IncludeDirective): void {
    // Write prefix/postfix
    this.writePrefix(includeDirective);
    // #include includes file content without evaluation
    // For now, not implemented (requires file system access)
    this.writePostfix(includeDirective);
  }

  private evaluateExpression(expr: Expression): any {
    switch (expr.type) {
      case 'Literal':
        return this.evaluateLiteral(expr);
      case 'VariableReference':
        return this.evaluateVariableReference(expr);
      case 'MemberAccess':
        return this.evaluateMemberAccess(expr);
      case 'FunctionCall':
        return this.evaluateFunctionCall(expr);
      case 'ArrayAccess':
        return this.evaluateArrayAccess(expr);
      case 'ObjectLiteral':
        return this.evaluateObjectLiteral(expr);
      case 'ArrayLiteral':
        return this.evaluateArrayLiteral(expr);
      case 'RangeLiteral':
        return this.evaluateRangeLiteral(expr);
      case 'BinaryOperation':
        return this.evaluateBinaryOperation(expr);
      case 'UnaryOperation':
        return this.evaluateUnaryOperation(expr);
      case 'TernaryOperation':
        return this.evaluateTernaryOperation(expr);
      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  private evaluateLiteral(literal: Literal): any {
    // Handle string interpolation for double-quoted strings
    if (literal.isDoubleQuoted && typeof literal.rawValue === 'string') {
      // Parse and evaluate the string as a mini-template
      return this.interpolateString(literal.rawValue);
    }
    return literal.value;
  }

  /**
   * Interpolate variables in a string (for double-quoted strings)
   * Handles $var and ${expr} patterns
   */
  private interpolateString(str: string): string {
    // Simple regex-based interpolation for $var patterns
    // This doesn't handle complex ${expr} yet, but covers most cases
    return str.replace(/\$(!?)([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, quiet, varName) => {
      const value = this.scopeManager.getVariable(varName) ?? this.getContextVariable(varName);
      if (value === undefined || value === null) {
        return quiet ? '' : match; // Quiet ref returns empty, normal ref returns literal
      }
      return String(value);
    });
  }

  private evaluateVariableReference(ref: VariableReference): any {
    const value = this.scopeManager.getVariable(ref.name);

    if (value === undefined) {
      // Check context for variable
      const contextValue = this.getContextVariable(ref.name);
      if (contextValue !== undefined) {
        return contextValue;
      }

      if (ref.quiet) {
        return '';
      }
      // In Velocity, undefined variables return empty string
      return '';
    }
    
    return value;
  }

  private evaluateMemberAccess(member: MemberAccess): any {
    const object = this.evaluateExpression(member.object);

    if (object === null || object === undefined) {
      return '';
    }

    if (typeof object === 'object' && object !== null) {
      const value = (object as any)[member.property];
      if (typeof value === 'function') {
        return value.bind(object);
      }
      return value !== undefined ? value : '';
    }

    return '';
  }

  private evaluateFunctionCall(call: FunctionCall): any {
    const callee = this.evaluateExpression(call.callee);
    const args = call.arguments.map(arg => this.evaluateExpression(arg));
    
    if (typeof callee === 'function') {
      return callee(...args);
    }
    
    return '';
  }

  private evaluateArrayAccess(access: ArrayAccess): any {
    const object = this.evaluateExpression(access.object);
    const index = this.evaluateExpression(access.index);
    
    if (Array.isArray(object) && typeof index === 'number') {
      return object[index] || '';
    }
    
    if (typeof object === 'object' && object !== null && typeof index === 'string') {
      return object[index] || '';
    }
    
    return '';
  }

  private evaluateObjectLiteral(obj: ObjectLiteral): any {
    const result: any = {};
    for (const prop of obj.properties) {
      result[prop.key] = this.evaluateExpression(prop.value);
    }
    return result;
  }

  private evaluateArrayLiteral(arr: ArrayLiteral): any {
    return arr.elements.map(elem => this.evaluateExpression(elem));
  }

  private evaluateRangeLiteral(range: RangeLiteral): any {
    const result = [];
    for (let i = range.start; i <= range.end; i++) {
      result.push(i);
    }
    return result;
  }

  private evaluateBinaryOperation(op: BinaryOperation): any {
    const left = this.evaluateExpression(op.left);
    const right = this.evaluateExpression(op.right);
    
    switch (op.operator) {
      case '+':
        // Java Velocity: + operator concatenates if either operand is a string
        // Otherwise, it does numeric addition (converting string numbers to numbers)
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        // Both are numbers (or numeric strings that weren't strings)
        const leftNum = typeof left === 'string' && !isNaN(Number(left)) ? Number(left) : Number(left) || 0;
        const rightNum = typeof right === 'string' && !isNaN(Number(right)) ? Number(right) : Number(right) || 0;
        return leftNum + rightNum;
      case '-':
        // Convert string numbers to numbers for subtraction
        const leftSub = typeof left === 'string' && !isNaN(Number(left)) ? Number(left) : left;
        const rightSub = typeof right === 'string' && !isNaN(Number(right)) ? Number(right) : right;
        return leftSub - rightSub;
      case '*':
        // Convert string numbers to numbers for multiplication
        const leftMul = typeof left === 'string' && !isNaN(Number(left)) ? Number(left) : left;
        const rightMul = typeof right === 'string' && !isNaN(Number(right)) ? Number(right) : right;
        return leftMul * rightMul;
      case '/':
        // Convert string numbers to numbers for division
        const leftDiv = typeof left === 'string' && !isNaN(Number(left)) ? Number(left) : left;
        const rightDiv = typeof right === 'string' && !isNaN(Number(right)) ? Number(right) : right;
        return rightDiv !== 0 ? leftDiv / rightDiv : null; // Java Velocity returns null for division by zero
      case '%':
        // Convert string numbers to numbers for modulo
        const leftMod = typeof left === 'string' && !isNaN(Number(left)) ? Number(left) : left;
        const rightMod = typeof right === 'string' && !isNaN(Number(right)) ? Number(right) : right;
        return rightMod !== 0 ? leftMod % rightMod : null; // Java Velocity returns null for modulo by zero
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '&&':
        return isTruthy(left) && isTruthy(right);
      case '||':
        return isTruthy(left) || isTruthy(right);
      default:
        throw new Error(`Unknown binary operator: ${op.operator}`);
    }
  }

  private evaluateUnaryOperation(op: UnaryOperation): any {
    const operand = this.evaluateExpression(op.operand);
    
    switch (op.operator) {
      case '+':
        return +operand;
      case '-':
        return -operand;
      case '!':
        return !isTruthy(operand);
      default:
        throw new Error(`Unknown unary operator: ${op.operator}`);
    }
  }

  private evaluateTernaryOperation(ternary: TernaryOperation): any {
    const condition = this.evaluateExpression(ternary.condition);
    return isTruthy(condition) 
      ? this.evaluateExpression(ternary.thenExpression)
      : this.evaluateExpression(ternary.elseExpression);
  }

  private appendInterpolatedValue(value: any): void {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      this.stringBuilder.appendString(value);
      return;
    }

    this.stringBuilder.append(value);
  }

  private initializeGlobalScope(): void {
    // Initialize variables from context
    if (this.context instanceof Map) {
      for (const [key, value] of this.context.entries()) {
        this.scopeManager.setVariable(key, value);
      }
    } else {
      for (const [key, value] of Object.entries(this.context)) {
        this.scopeManager.setVariable(key, value);
      }
    }
  }

  private getContextVariable(name: string): any {
    if (this.context instanceof Map) {
      return this.context.get(name);
    } else {
      return this.context[name];
    }
  }
}

// Helper functions for Velocity truthiness and type checking
function isTruthy(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0 && !isNaN(value);
  }
  if (typeof value === 'string') {
    return value.length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return true;
}

function isIterable(value: any): boolean {
  return Array.isArray(value) || 
         (value && typeof value[Symbol.iterator] === 'function');
}
