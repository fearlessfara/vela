/** AWS-SPEC: VTL Engine | OWNER: vela | STATUS: READY */
import { ApiGatewayEvent } from './input';
import { ApiGatewayContext } from './context';
import { FeatureFlags } from '../config/featureFlags';
export interface RenderTemplateOptions {
    template: string;
    event: ApiGatewayEvent;
    context?: ApiGatewayContext;
    flags?: Partial<FeatureFlags>;
}
export interface RenderTemplateResult {
    output: string;
    errors: string[];
}
export declare class VtlEngine {
    private parser;
    constructor();
    renderTemplate(options: RenderTemplateOptions): RenderTemplateResult;
    private createEvaluationContext;
    private createDefaultContext;
}
export declare function renderTemplate(options: RenderTemplateOptions): RenderTemplateResult;
