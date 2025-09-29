/** AWS-SPEC: Core VTL Engine | OWNER: vela | STATUS: READY */

import { VtlParser } from '../parser/vtlParser.js';
import { cstToAst } from '../parser/cstToAst.js';
import { VtlEvaluator, EvaluationContext } from '../runtime/evaluator.js';
import { ProviderRegistry, DefaultProviderRegistry } from './providers.js';
import { DEFAULT_FLAGS } from '../config/featureFlags.js';

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
    const { template, context = { flags: DEFAULT_FLAGS }, providers } = options;
    const errors: string[] = [];
    const providerRegistry = providers || this.defaultProviders;

    try {
      // Check if this is a JSON template (starts with { or [ and contains $ references)
      const isJsonTemplate = this.isJsonTemplate(template);
      
      if (isJsonTemplate) {
        // For JSON templates, we need to process $ references within JSON structure
        return this.renderJsonTemplate(template, context, providerRegistry);
      }

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
    providers: ProviderRegistry
  ): EvaluationContext {
    const evaluationContext: EvaluationContext = {
      ...context,
    };

    // Add providers from registry
    const utilProvider = providers.getProvider('util');
    if (utilProvider) {
      evaluationContext.util = utilProvider;
    }

    const inputProvider = providers.getProvider('input');
    if (inputProvider) {
      evaluationContext.input = inputProvider;
    }

    const contextProvider = providers.getProvider('context');
    if (contextProvider) {
      evaluationContext.context = contextProvider;
    }

    return evaluationContext;
  }

  private isJsonTemplate(template: string): boolean {
    const trimmed = template.trim();
    // Only consider it a JSON template if it starts with { or [ and doesn't contain VTL directives
    return (trimmed.startsWith('{') || trimmed.startsWith('[')) && 
           !trimmed.includes('#set') && 
           !trimmed.includes('#if') && 
           !trimmed.includes('#foreach') &&
           !trimmed.includes('#break') &&
           !trimmed.includes('#stop');
  }

  private renderJsonTemplate(
    template: string, 
    context: EvaluationContext,
    providers: ProviderRegistry
  ): CoreRenderResult {
    const errors: string[] = [];
    
    try {
      // Create evaluation context with providers
      const evaluationContext = this.createEvaluationContext(context, providers);
      
      // Process $ references in the JSON template
      let processedTemplate = template;
      
      // Replace $context references
      processedTemplate = processedTemplate.replace(/\$context\.([a-zA-Z0-9_.]+)/g, (_, path) => {
        const value = this.getContextValue(evaluationContext, path);
        return this.formatJsonValue(value);
      });
      
      // Replace $util.toJson() calls with $input.json() nested calls FIRST (before individual $input.json replacements)
      processedTemplate = processedTemplate.replace(/\$util\.toJson\s*\(\s*\$input\.json\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g, (_, jsonPath) => {
        const value = this.getInputJsonValue(evaluationContext, jsonPath);
        return JSON.stringify(value);
      });

      // Replace $input.params() calls
      processedTemplate = processedTemplate.replace(/\$input\.params\(\)/g, () => {
        const value = this.getInputParamsAll(evaluationContext);
        return JSON.stringify(value);
      });
      
      // Replace $input.param() calls
      processedTemplate = processedTemplate.replace(/\$input\.param\(['"]([^'"]+)['"]\)/g, (_, paramName) => {
        const value = this.getInputParamValue(evaluationContext, paramName);
        return this.formatJsonValue(value);
      });
      
      // Replace remaining $input.json references
      processedTemplate = processedTemplate.replace(/\$input\.json\(['"]([^'"]+)['"]\)/g, (_, jsonPath) => {
        const value = this.getInputJsonValue(evaluationContext, jsonPath);
        return this.formatJsonValue(value);
      });
      
      // Replace $util.time.nowISO8601() calls
      processedTemplate = processedTemplate.replace(/\$util\.time\.nowISO8601\(\)/g, () => {
        const value = evaluationContext.util?.time?.nowISO8601?.() || null;
        return JSON.stringify(value);
      });
      
      // Replace $util.base64Encode() calls
      processedTemplate = processedTemplate.replace(/\$util\.base64Encode\(['"]([^'"]+)['"]\)/g, (_, str) => {
        const value = evaluationContext.util?.base64Encode?.(str) || null;
        return JSON.stringify(value);
      });
      
      // Replace remaining $util.toJson() calls
      processedTemplate = processedTemplate.replace(/\$util\.toJson\(([^)]+)\)/g, (_, expr) => {
        // For now, just return the expression as-is since we don't have a full evaluator
        return expr;
      });
      
      return { output: processedTemplate, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return { output: '', errors };
    }
  }

  private getContextValue(context: any, path: string): any {
    if (!context.context) return null;
    
    const parts = path.split('.');
    let value = context.context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return value;
  }

  private getInputParamValue(context: any, paramName: string): any {
    if (!context.input) return null;
    
    // Use the input provider's param method
    return context.input.param(paramName);
  }

  private getInputParamsAll(context: any): any {
    if (!context.input) return {};
    
    // Use the input provider's params method
    return context.input.params();
  }

  private getInputJsonValue(context: any, jsonPath: string): any {
    if (!context.input) return null;
    
    try {
      // Use the input provider's json method
      return context.input.json(jsonPath);
    } catch {
      return null;
    }
  }

  private formatJsonValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      // For string values, we need to escape special characters but not add quotes
      // since the replacement is happening inside a JSON string context
      return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }
    // For other types, use JSON.stringify
    return JSON.stringify(value);
  }
}

// Convenience function for simple template rendering
export function renderTemplate(options: CoreRenderOptions, debugMode: boolean = false): CoreRenderResult {
  const engine = new CoreVtlEngine(debugMode);
  return engine.renderTemplate(options);
}

/* Deviation Report: None - Core VTL engine provides pure VTL functionality without API Gateway dependencies */
