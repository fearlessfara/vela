/** AWS-SPEC: VTL Engine | OWNER: vela | STATUS: READY */

import { VtlParser } from '../parser/vtlParser.js';
import { cstToAst } from '../parser/cstToAst.js';
import { VtlEvaluator, EvaluationContext } from '../runtime/evaluator.js';
import { createUtilProvider } from './util.js';
import { createInputProvider, ApiGatewayEvent } from './input.js';
import { createContextProvider, ApiGatewayContext } from './context.js';
import { FeatureFlags, DEFAULT_FLAGS, isFlagEnabled } from '../config/featureFlags.js';

// APIGW:VTL Engine

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

export class VtlEngine {
  private parser: VtlParser;

  constructor() {
    this.parser = new VtlParser();
  }

  renderTemplate(options: RenderTemplateOptions): RenderTemplateResult {
    const { template, event, context, flags = {} } = options;
    const mergedFlags = { ...DEFAULT_FLAGS, ...flags };
    const errors: string[] = [];

    try {
      // Parse the template
      const parseResult = this.parser.parse(template);
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        errors.push(...parseResult.errors.map((e: any) => e.message));
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
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return { output: '', errors };
    }
  }

  private createEvaluationContext(
    event: ApiGatewayEvent,
    context?: ApiGatewayContext,
    flags: FeatureFlags = DEFAULT_FLAGS
  ): EvaluationContext {
    const evaluationContext: EvaluationContext = {
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

  private createDefaultContext(event: ApiGatewayEvent): ApiGatewayContext {
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
export function renderTemplate(options: RenderTemplateOptions): RenderTemplateResult {
  const engine = new VtlEngine();
  return engine.renderTemplate(options);
}

/* Deviation Report: None - VTL engine matches AWS API Gateway VTL specification */
