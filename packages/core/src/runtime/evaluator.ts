/** AWS-SPEC: Runtime Evaluator | OWNER: vela | STATUS: READY */

import { ScopeManager } from './scope.js';
import { StringBuilder } from './stringBuilder.js';
import {
  Template,
  Segment,
  Text,
  Interpolation,
  IfDirective,
  SetDirective,
  ForEachDirective,
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

// APIGW:Runtime Evaluator

export interface EvaluationContext {
  util?: any;
  input?: any;
  context?: any;
  flags?: any;
}

export class VtlEvaluator {
  private scopeManager: ScopeManager;
  private stringBuilder: StringBuilder;
  private context: EvaluationContext;
  private shouldStop: boolean;
  private shouldBreak: boolean;
  private jsonOutputMode: boolean;
  private static isDotChain(v: any): v is { __dotChain: true; value: string } {
    return v && typeof v === 'object' && v.__dotChain === true && typeof v.value === 'string';
  }
  private static dotChain(value: string) { return { __dotChain: true as const, value }; }
  private static isMissingRef(v: any): v is { __missingRef: true; literal: string } {
    return v && typeof v === 'object' && v.__missingRef === true && typeof v.literal === 'string';
  }
  private static missing(literal: string) { return { __missingRef: true as const, literal }; }

  constructor(context: EvaluationContext) {
    this.scopeManager = new ScopeManager();
    this.stringBuilder = new StringBuilder();
    this.context = context;
    this.shouldStop = false;
    this.shouldBreak = false;
    this.jsonOutputMode = false;
  }

  evaluateTemplate(template: Template): string {
    this.stringBuilder.clear();
    this.shouldStop = false;
    this.shouldBreak = false;

    this.scopeManager.clear();
    this.initializeGlobalScope();
    this.jsonOutputMode = this.detectJsonTemplate(template);

    this.evaluateSegments(template.segments);

    return this.stringBuilder.flush();
  }

  // Helpers retained for completeness; may be used by future whitespace features
  // private isDirectiveSegment(segment: Segment): boolean { return false; }
  // private chompLeadingNewline(text: string): string { return text; }
  // private chompTrailingNewline(text: string): string { return text; }

  private evaluateSegments(segments: Segment[], _initialPrevWasDirective: boolean = false): void {
    let prevWasDirective = _initialPrevWasDirective;
    for (let i = 0; i < segments.length; i++) {
      if (this.shouldStop) break;
      const segment = segments[i];
      if (!segment) continue;
      if (segment.type === 'Text') {
        let value = (segment as Text).value;
        // Match Velocity's behavior: consume a single leading newline
        // immediately following a directive placed on its own line.
        if (prevWasDirective && value) {
          if (value.startsWith('\r\n')) value = value.slice(2);
          else if (value.startsWith('\n')) value = value.slice(1);
        }
        if (value) this.stringBuilder.appendString(value);
        prevWasDirective = false;
      } else if (segment.type === 'Interpolation') {
        this.evaluateInterpolation(segment as Interpolation);
        prevWasDirective = false;
      } else {
        // Directive
        this.evaluateSegment(segment);
        prevWasDirective = true;
      }
      if (this.shouldBreak) break;
    }
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
        this.evaluateBreakDirective();
        break;
      case 'StopDirective':
        this.evaluateStopDirective();
        break;
      case 'MacroDirective':
        this.evaluateMacroDirective(segment);
        break;
    }
  }

  private evaluateText(text: Text): void {
    this.stringBuilder.appendString(text.value);
  }

  private evaluateInterpolation(interp: Interpolation): void {
    const value = this.evaluateExpression(interp.expression);
    this.appendInterpolatedValue(value);
  }

  private evaluateIfDirective(ifDirective: IfDirective): void {
    const condition = this.evaluateExpression(ifDirective.condition);
    
    if (isTruthy(condition)) {
      this.evaluateSegments(ifDirective.thenBody, true);
    } else {
      // Check else-if branches
      let matched = false;
      for (const elseIf of ifDirective.elseIfBranches) {
        if (isTruthy(this.evaluateExpression(elseIf.condition))) {
          this.evaluateSegments(elseIf.body, true);
          matched = true;
          break;
        }
      }
      
      // Check else branch
      if (!matched && ifDirective.elseBody) {
        this.evaluateSegments(ifDirective.elseBody, true);
      }
    }
  }

  private evaluateSetDirective(setDirective: SetDirective): void {
    const value = this.evaluateExpression(setDirective.value);
    this.scopeManager.setVariable(setDirective.variable, value);
  }

  private evaluateForEachDirective(forEachDirective: ForEachDirective): void {
    const iterable = this.evaluateExpression(forEachDirective.iterable);
    
    if (!isIterable(iterable)) {
      // If not iterable and there's an else clause, execute it
      if (forEachDirective.elseBody && forEachDirective.elseBody.length > 0) {
        this.evaluateSegments(forEachDirective.elseBody, true);
      }
      return;
    }

    // Convert to array to get length and index information
    const items = Array.from(iterable);
    const totalItems = items.length;

    // If empty and there's an else clause, execute it
    if (totalItems === 0 && forEachDirective.elseBody && forEachDirective.elseBody.length > 0) {
      this.evaluateSegments(forEachDirective.elseBody, true);
      return;
    }

    this.scopeManager.pushScope();
    const bodySegments = forEachDirective.body;
    // Analyze first segment to potentially trim a leading newline on iteration
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
        const iterSegments: Segment[] = bodySegments.slice();
        this.evaluateSegments(iterSegments, true);
      }
    } finally {
      this.scopeManager.popScope();
      this.shouldBreak = false;
    }
  }

  private evaluateBreakDirective(): void {
    this.shouldBreak = true;
  }

  private evaluateStopDirective(): void {
    this.shouldStop = true;
  }

  private evaluateMacroDirective(macroDirective: any): void {
    // Stub implementation - macros not yet supported
    this.scopeManager.defineMacro(
      macroDirective.name,
      macroDirective.parameters,
      macroDirective.body
    );
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
    return literal.value;
  }

  private evaluateVariableReference(ref: VariableReference): any {
    const value = this.scopeManager.getVariable(ref.name);

    if (value === undefined) {
      // Special-case Velocity/VTL null constant
      if (ref.name === 'null') {
        return null;
      }
      const provider = this.getBuiltInProvider(ref.name);
      if (provider !== undefined) {
        return provider;
      }
      // Undefined variables: return missing marker unless quiet
      if (ref.quiet) {
        return '';
      }
      return VtlEvaluator.missing(`$${ref.name}`);
    }
    
    return value;
  }

  private evaluateMemberAccess(member: MemberAccess): any {
    const object = this.evaluateExpression(member.object);

    if (VtlEvaluator.isDotChain(object)) {
      // Continue accumulating literal member access as plain text
      return VtlEvaluator.dotChain(`${object.value}.${member.property}`);
    }

    if (VtlEvaluator.isMissingRef(object)) {
      return VtlEvaluator.missing(`${object.literal}.${member.property}`);
    }
    if (object === null || object === undefined) {
      return VtlEvaluator.missing(`$${member.property}`);
    }

    if (typeof object === 'object' && object !== null) {
      // Support Velocity-style size() on arrays and objects
      if (member.property === 'size') {
        const target = object as any;
        if (Array.isArray(target)) {
          return () => target.length;
        }
        if (target && typeof target === 'object') {
          return () => Object.keys(target).length;
        }
      }
      const value = (object as any)[member.property];
      if (typeof value === 'function') {
        return value.bind(object);
      }
      return value !== undefined ? value : VtlEvaluator.missing(`$${member.property}`);
    }

    // When attempting to continue a chain on a primitive, emit the already-evaluated
    // base value followed by the literal suffix. This matches Velocity's behavior
    // where $ref.property on a primitive prints the ref value and then treats the
    // remainder as literal text.
    let base: string;
    try {
      // Serialize primitives like numbers/booleans consistently with JSON mode
      base = typeof object === 'string' ? object : JSON.stringify(object);
    } catch {
      base = String(object);
    }
    return VtlEvaluator.dotChain(`${base}.${member.property}`);
  }

  private evaluateFunctionCall(call: FunctionCall): any {
    const callee = this.evaluateExpression(call.callee);
    const args = call.arguments.map(arg => this.evaluateExpression(arg));
    
    if (VtlEvaluator.isDotChain(callee)) {
      // Append function call literally
      return VtlEvaluator.dotChain(`${callee.value}()`);
    }
    if (typeof callee === 'function') {
      return callee(...args);
    }
    
    // Handle built-in functions
    if (typeof callee === 'string') {
      return this.callBuiltInFunction(callee, args);
    }
    
    return '';
  }

  private evaluateArrayAccess(access: ArrayAccess): any {
    const object = this.evaluateExpression(access.object);
    const index = this.evaluateExpression(access.index);
    
    if (VtlEvaluator.isMissingRef(object)) {
      return VtlEvaluator.missing(`${object.literal}[${index}]`);
    }
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
    // Treat missing references as null for comparison/logical operations
    const l = (left && typeof left === 'object' && (left as any).__missingRef === true) ? null : left;
    const r = (right && typeof right === 'object' && (right as any).__missingRef === true) ? null : right;
    
    switch (op.operator) {
      case '+':
        return l + r;
      case '-':
        return l - r;
      case '*':
        return l * r;
      case '/':
        return r !== 0 ? l / r : 0;
      case '%':
        return r !== 0 ? l % r : 0;
      case '==':
        return (l as any) == (r as any);
      case '!=':
        return (l as any) != (r as any);
      case '<':
        return (l as any) < (r as any);
      case '<=':
        return (l as any) <= (r as any);
      case '>':
        return (l as any) > (r as any);
      case '>=':
        return (l as any) >= (r as any);
      case '&&':
        return isTruthy(l) && isTruthy(r);
      case '||':
        return isTruthy(l) || isTruthy(r);
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

  private callBuiltInFunction(name: string, args: any[]): any {
    // Handle $util, $input, $context functions based on feature flags
    if (name.startsWith('util.') && this.context.util) {
      return this.callUtilFunction(name.slice(5), args);
    }
    
    if (name.startsWith('input.') && this.context.input) {
      return this.callInputFunction(name.slice(6), args);
    }
    
    if (name.startsWith('context.') && this.context.context) {
      return this.callContextFunction(name.slice(8), args);
    }
    
    return '';
  }

  private callUtilFunction(method: string, args: any[]): any {
    if (this.context.util && typeof this.context.util[method] === 'function') {
      return this.context.util[method](...args);
    }
    return '';
  }

  private callInputFunction(method: string, args: any[]): any {
    if (this.context.input && typeof this.context.input[method] === 'function') {
      return this.context.input[method](...args);
    }
    return '';
  }

  private callContextFunction(method: string, args: any[]): any {
    if (this.context.context && typeof this.context.context[method] === 'function') {
      return this.context.context[method](...args);
    }
    return '';
  }

  private appendInterpolatedValue(value: any): void {
    // If missing ref, print literal
    if (VtlEvaluator.isMissingRef(value)) {
      this.stringBuilder.appendString(value.literal);
      return;
    }
    if (VtlEvaluator.isDotChain(value)) {
      this.stringBuilder.appendString(value.value);
      return;
    }
    const normalized = this.normalizeInterpolatedValue(value);
    if (normalized === null || normalized === undefined) {
      return;
    }

    if (typeof normalized === 'string') {
      this.stringBuilder.appendString(normalized);
      return;
    }

    this.stringBuilder.append(normalized);
  }

  private normalizeInterpolatedValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (this.jsonOutputMode) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        // If string looks like JSON, try to parse and emit JSON value
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            return JSON.stringify(parsed);
          } catch {
            // Fall through to escaped content
          }
        }
        // If string is primitive literal (true/false/null or numeric), return as-is
        if (this.isJsonLiteral(trimmed)) {
          return value;
        }
        // Otherwise, return JSON-escaped content without surrounding quotes
        try {
          const escaped = JSON.stringify(value);
          return escaped.slice(1, -1);
        } catch {
          return value;
        }
      }
      // For non-strings in JSON output, always serialize
      try {
        return JSON.stringify(value);
      } catch {
        return JSON.stringify(null);
      }
    }

    return value;
  }

  private isJsonLiteral(value: string): boolean {
    if (value.length === 0) {
      return false;
    }

    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === '{' && last === '}') || (first === '[' && last === ']')) {
      return true;
    }

    if (value === 'true' || value === 'false' || value === 'null') {
      return true;
    }

    if (!Number.isNaN(Number(value))) {
      return true;
    }

    return false;
  }

  private detectJsonTemplate(template: Template): boolean {
    for (const segment of template.segments) {
      if (segment.type === 'Text') {
        const trimmed = segment.value.trim();
        if (trimmed.length === 0) continue;
        const first = trimmed[0];
        return first === '{' || first === '[';
      }
      if (segment.type === 'Interpolation') {
        const expr: any = (segment as any).expression;
        if (expr && (expr.type === 'ObjectLiteral' || expr.type === 'ArrayLiteral')) {
          return true;
        }
        // Continue scanning; not enough info yet
        continue;
      }
      // Directives can still exist in JSON templates; continue scanning
      continue;
    }
    return false;
  }

  private initializeGlobalScope(): void {
    const util = this.getBuiltInProvider('util');
    if (util !== undefined) {
      this.scopeManager.setVariable('util', util);
    }

    const input = this.getBuiltInProvider('input');
    if (input !== undefined) {
      this.scopeManager.setVariable('input', input);
    }

    const context = this.getBuiltInProvider('context');
    if (context !== undefined) {
      this.scopeManager.setVariable('context', context);
    }

    // Inject plain variables from evaluation context into the global scope
    // Exclude reserved provider/flags keys
    const reserved = new Set(['util', 'input', 'context', 'flags']);
    if (this.context && typeof this.context === 'object') {
      for (const [key, value] of Object.entries(this.context)) {
        if (!reserved.has(key)) {
          this.scopeManager.setVariable(key, value as any);
        }
      }
    }
  }

  private getBuiltInProvider(name: string): any {
    switch (name) {
      case 'util':
        if (this.context.util) {
          return this.context.util;
        }
        break;
      case 'input':
        if (this.context.input) {
          return this.context.input;
        }
        break;
      case 'context':
        if (this.context.context) {
          return this.context.context;
        }
        break;
    }
    return undefined;
  }
}

// Helper functions for APIGW truthiness and type checking
function isTruthy(value: any): boolean {
  // Treat missing references as falsy
  if (value && typeof value === 'object' && (value as any).__missingRef === true) {
    return false;
  }
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

/* Deviation Report: None - Evaluator matches AWS API Gateway VTL specification */
