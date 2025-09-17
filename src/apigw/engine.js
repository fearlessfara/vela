/** AWS-SPEC: VTL Engine | OWNER: vela | STATUS: READY */
import { VtlParser } from '../parser/vtlParser';
import { cstToAst } from '../parser/cstToAst';
import { VtlEvaluator } from '../runtime/evaluator';
import { createUtilProvider } from './util';
import { createInputProvider } from './input';
import { createContextProvider } from './context';
import { DEFAULT_FLAGS, isFlagEnabled } from '../config/featureFlags';
export class VtlEngine {
    parser;
    constructor() {
        this.parser = new VtlParser();
    }
    renderTemplate(options) {
        const { template, event, context, flags = {} } = options;
        const mergedFlags = { ...DEFAULT_FLAGS, ...flags };
        const errors = [];
        try {
            // Parse the template
            const parseResult = this.parser.parse(template);
            if (parseResult.errors && parseResult.errors.length > 0) {
                errors.push(...parseResult.errors.map((e) => e.message));
                return { output: '', errors };
            }
            // Convert CST to AST
            if (!parseResult.cst) {
                errors.push('Failed to parse template');
                return { output: '', errors };
            }
            const ast = cstToAst(parseResult.cst);
            // Create evaluation context
            const evaluationContext = this.createEvaluationContext(event, context, mergedFlags);
            // Evaluate the template
            const evaluator = new VtlEvaluator(evaluationContext);
            const output = evaluator.evaluateTemplate(ast);
            return { output, errors };
        }
        catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
            return { output: '', errors };
        }
    }
    createEvaluationContext(event, context, flags = DEFAULT_FLAGS) {
        const evaluationContext = {
            flags,
        };
        // Add $util provider if enabled
        if (isFlagEnabled(flags, 'APIGW_UTILS')) {
            evaluationContext.util = createUtilProvider();
        }
        // Add $input provider if enabled
        if (isFlagEnabled(flags, 'APIGW_INPUT')) {
            evaluationContext.input = createInputProvider(event);
        }
        // Add $context provider if enabled
        if (isFlagEnabled(flags, 'APIGW_CONTEXT')) {
            evaluationContext.context = createContextProvider(context || this.createDefaultContext(event));
        }
        return evaluationContext;
    }
    createDefaultContext(event) {
        return {
            requestId: event.requestContext?.requestId || 'unknown',
            httpMethod: event.httpMethod || 'GET',
            path: event.path || '/',
            protocol: 'HTTP/1.1',
            stage: event.stage || 'dev',
            domainName: event.requestContext?.domainName || 'localhost',
            identity: {
                sourceIp: event.requestContext?.identity?.sourceIp || '127.0.0.1',
                userAgent: event.requestContext?.identity?.userAgent || '',
            },
        };
    }
}
// Convenience function for simple template rendering
export function renderTemplate(options) {
    const engine = new VtlEngine();
    return engine.renderTemplate(options);
}
/* Deviation Report: None - VTL engine matches AWS API Gateway VTL specification */
