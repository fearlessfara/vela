/** Apache Velocity: Velocity Engine | OWNER: vela | STATUS: READY */
import { EvaluationContext } from './runtime/evaluator.js';
export interface VelocityEngineOptions {
    template: string;
    context?: EvaluationContext;
    debugMode?: boolean;
}
export declare class VelocityEngine {
    private parser;
    constructor(debugMode?: boolean);
    render(template: string, context?: EvaluationContext): string;
}
export declare function renderTemplate(template: string, context?: EvaluationContext, debugMode?: boolean): string;
