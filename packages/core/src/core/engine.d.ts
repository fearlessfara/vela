/** AWS-SPEC: Core VTL Engine | OWNER: vela | STATUS: READY */
import { EvaluationContext } from '../runtime/evaluator';
import { ProviderRegistry } from './providers';
export interface CoreRenderOptions {
    template: string;
    context?: EvaluationContext;
    providers?: ProviderRegistry;
}
export interface CoreRenderResult {
    output: string;
    errors: string[];
}
export declare class CoreVtlEngine {
    private parser;
    private defaultProviders;
    constructor(debugMode?: boolean, providers?: ProviderRegistry);
    renderTemplate(options: CoreRenderOptions): CoreRenderResult;
    private createEvaluationContext;
}
export declare function renderTemplate(options: CoreRenderOptions, debugMode?: boolean): CoreRenderResult;
