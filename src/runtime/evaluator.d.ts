/** Apache Velocity: Runtime Evaluator | OWNER: vela | STATUS: READY */
import { Template } from '../parser/ast.js';
export type EvaluationContext = Map<string, any> | Record<string, any>;
export declare class VtlEvaluator {
    private scopeManager;
    private stringBuilder;
    private context;
    private shouldStop;
    private shouldBreak;
    constructor(context: EvaluationContext);
    evaluateTemplate(template: Template): string;
    private evaluateSegment;
    private evaluateText;
    private evaluateInterpolation;
    private evaluateIfDirective;
    private evaluateSetDirective;
    private evaluateForEachDirective;
    private evaluateBreakDirective;
    private evaluateStopDirective;
    private evaluateMacroDirective;
    private evaluateEvaluateDirective;
    private evaluateParseDirective;
    private evaluateIncludeDirective;
    private evaluateExpression;
    private evaluateLiteral;
    private evaluateVariableReference;
    private evaluateMemberAccess;
    private evaluateFunctionCall;
    private evaluateArrayAccess;
    private evaluateObjectLiteral;
    private evaluateArrayLiteral;
    private evaluateRangeLiteral;
    private evaluateBinaryOperation;
    private evaluateUnaryOperation;
    private evaluateTernaryOperation;
    private appendInterpolatedValue;
    private initializeGlobalScope;
    private getContextVariable;
}
