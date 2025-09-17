/** AWS-SPEC: Runtime Evaluator | OWNER: vela | STATUS: READY */
import { FeatureFlags } from '../config/featureFlags';
import { Template } from '../parser/ast';
export interface EvaluationContext {
    util?: any;
    input?: any;
    context?: any;
    flags: FeatureFlags;
}
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
    private evaluateExpression;
    private evaluateLiteral;
    private evaluateVariableReference;
    private evaluateMemberAccess;
    private evaluateFunctionCall;
    private evaluateArrayAccess;
    private evaluateObjectLiteral;
    private evaluateArrayLiteral;
    private evaluateBinaryOperation;
    private evaluateUnaryOperation;
    private evaluateTernaryOperation;
    private callBuiltInFunction;
    private callUtilFunction;
    private callInputFunction;
    private callContextFunction;
}
