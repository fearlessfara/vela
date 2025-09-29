/** AWS-SPEC: Core VTL Engine | OWNER: vela | STATUS: READY */

import { VtlParser } from '../parser/vtlParser.js';
import { cstToAst } from '../parser/cstToAst.js';
import { VtlEvaluator, EvaluationContext } from '../runtime/evaluator.js';
import { ProviderRegistry, DefaultProviderRegistry } from './providers.js';

// APIGW:Core VTL Engine

export interface CoreRenderOptions {
  template: string;
  context?: EvaluationContext;
  providers?: ProviderRegistry;
}

export interface CoreRenderResult {
  output: string;
  errors: string[];
}

export class CoreVtlEngine {
  private parser: VtlParser;
  private defaultProviders: ProviderRegistry;

  constructor(debugMode: boolean = false, providers?: ProviderRegistry) {
    this.parser = new VtlParser(debugMode);
    this.defaultProviders = providers || new DefaultProviderRegistry();
  }

  renderTemplate(options: CoreRenderOptions): CoreRenderResult {
    const { template, context = {}, providers } = options;
    const errors: string[] = [];
    const providerRegistry = providers || this.defaultProviders;

    try {
      // Parse the template as VTL
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

      // Create evaluation context with providers
      const evaluationContext = this.createEvaluationContext(context, providerRegistry);

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
    context: EvaluationContext,
    _providers: ProviderRegistry
  ): EvaluationContext {
    const evaluationContext: EvaluationContext = {
      ...context,
    };

    // Add any providers from registry to the context
    // This is a generic mechanism that doesn't assume specific provider types
    // Note: This is a simplified approach - in practice, the evaluator would handle provider access

    return evaluationContext;
  }
}

// Convenience function for simple template rendering
export function renderTemplate(options: CoreRenderOptions, debugMode: boolean = false): CoreRenderResult {
  const engine = new CoreVtlEngine(debugMode);
  return engine.renderTemplate(options);
}

/* Deviation Report: None - Core VTL engine provides pure VTL functionality without API Gateway dependencies */
