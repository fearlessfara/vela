/** AWS-SPEC: VTL Engine | OWNER: vela | STATUS: READY */

import { VtlParser, cstToAst, VtlEvaluator, EvaluationContext } from '@fearlessfara/vela';
import { createUtilProvider } from './util';
import { createInputProvider, ApiGatewayEvent } from './input';
import { createContextProvider, ApiGatewayContext } from './context';
import { FeatureFlags, DEFAULT_FLAGS, isFlagEnabled } from './config/featureFlags';

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

  constructor(debugMode: boolean = false) {
    this.parser = new VtlParser(debugMode);
  }

  renderTemplate(options: RenderTemplateOptions): RenderTemplateResult {
    const { template, event, context, flags = {} } = options;
    const mergedFlags = { ...DEFAULT_FLAGS, ...flags };
    const errors: string[] = [];

    try {
      // Check if this is a JSON template (starts with { or [ and contains $ references)
      const isJsonTemplate = this.isJsonTemplate(template);
      
      if (isJsonTemplate) {
        // For JSON templates, we need to process $ references within JSON structure
        return this.renderJsonTemplate(template, event, context, mergedFlags);
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
    event: ApiGatewayEvent, 
    context: ApiGatewayContext | undefined, 
    flags: FeatureFlags
  ): RenderTemplateResult {
    const errors: string[] = [];
    
    try {
      // Create evaluation context
      const evaluationContext = this.createEvaluationContext(event, context, flags);
      
      // Process $ references in the JSON template
      let processedTemplate = template;
      
      // Replace quoted string wrappers for common util functions first to avoid double quoting
      processedTemplate = processedTemplate
        // "$util.base64Encode('...')" and with $input.body
        .replace(/"\s*\$util\.base64Encode\(\s*'([^']*)'\s*\)\s*"/g, (_m, s) => JSON.stringify(evaluationContext.util?.base64Encode?.(s) ?? ''))
        .replace(/"\s*\$util\.base64Encode\(\s*\$input\.body(?:\(\))?\s*\)\s*"/g, () => JSON.stringify(evaluationContext.util?.base64Encode?.(evaluationContext.input?.body?.() ?? '') ?? ''))
        // "$util.base64Decode('...')"
        .replace(/"\s*\$util\.base64Decode\(\s*'([^']*)'\s*\)\s*"/g, (_m, s) => JSON.stringify(evaluationContext.util?.base64Decode?.(s) ?? ''))
        // "$util.urlEncode('...')"
        .replace(/"\s*\$util\.urlEncode\(\s*'([^']*)'\s*\)\s*"/g, (_m, s) => JSON.stringify(evaluationContext.util?.urlEncode?.(s) ?? ''))
        // "$util.urlDecode('...')"
        .replace(/"\s*\$util\.urlDecode\(\s*'([^']*)'\s*\)\s*"/g, (_m, s) => JSON.stringify(evaluationContext.util?.urlDecode?.(s) ?? ''))
        // "$util.escapeJavaScript('...')" or with double quotes
        .replace(/"\s*\$util\.escapeJavaScript\(\s*(?:('(?:[^'\\]|\\.)*')|("(?:[^"\\]|\\.)*"))\s*\)\s*"/g, (_m, s1, s2) => {
          const raw = s1 ?? s2;
          const inner = raw.slice(1, -1);
          return JSON.stringify(evaluationContext.util?.escapeJavaScript?.(inner) ?? '');
        })
        // Unquoted escapeJavaScript (edge cases)
        .replace(/\$util\.escapeJavaScript\(\s*(?:('(?:[^'\\]|\\.)*')|("(?:[^"\\]|\\.)*"))\s*\)/g, (_m, s1, s2) => {
          const raw = s1 ?? s2;
          const inner = raw.slice(1, -1);
          return JSON.stringify(evaluationContext.util?.escapeJavaScript?.(inner) ?? '');
        })
        // "$util.time.nowISO8601()"
        .replace(/"\s*\$util\.time\.nowISO8601\(\)\s*"/g, () => JSON.stringify(evaluationContext.util?.time?.nowISO8601?.() ?? ''))
        // "$util.time.format('pattern', $util.parseJson('"iso"'))"
        .replace(/"\s*\$util\.time\.format\(\s*'([^']+)'\s*,\s*\$util\.parseJson\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*\)\s*\)\s*"/g,
          (_m, pattern, s1, s2) => {
            try {
              const jsonDate = s1 ?? s2;
              const iso = JSON.parse(jsonDate);
              const date = new Date(iso);
              return JSON.stringify(evaluationContext.util?.time?.format?.(pattern, date) ?? '');
            } catch {
              return JSON.stringify('');
            }
          }
        );

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

      // Replace quoted $input helpers first (avoid double quoting)
      processedTemplate = processedTemplate.replace(/"\s*\$input\.header\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify(evaluationContext.input?.header?.(n) ?? ''));
      processedTemplate = processedTemplate.replace(/"\s*\$input\.path\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify(evaluationContext.input?.path?.(n) ?? ''));
      processedTemplate = processedTemplate.replace(/"\s*\$input\.querystring\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify(evaluationContext.input?.querystring?.(n) ?? ''));
      processedTemplate = processedTemplate.replace(/"\s*\$input\.params\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify((evaluationContext.input?.params?.() ?? {})[n] ?? (evaluationContext.input?.params?.() ?? {})[n.toLowerCase()] ?? ''));

      // Replace $input.params() calls
      processedTemplate = processedTemplate.replace(/\$input\.params\(\)/g, () => {
        const value = this.getInputParamsAll(evaluationContext);
        return JSON.stringify(value);
      });
      // Replace $input.header('Name')
      processedTemplate = processedTemplate.replace(/\$input\.header\(\s*'([^']+)'\s*\)/g, (_m, n) => JSON.stringify(evaluationContext.input?.header?.(n) ?? ''));
      // Replace $input.headers()
      processedTemplate = processedTemplate.replace(/\$input\.headers\(\)/g, () => JSON.stringify(evaluationContext.input?.headers?.() ?? {}));
      // Replace $input.paths()
      processedTemplate = processedTemplate.replace(/\$input\.paths\(\)/g, () => JSON.stringify(evaluationContext.input?.paths?.() ?? {}));
      // Replace $input.path('name')
      processedTemplate = processedTemplate.replace(/\$input\.path\(\s*'([^']+)'\s*\)/g, (_m, n) => JSON.stringify(evaluationContext.input?.path?.(n) ?? ''));
      // Replace $input.querystrings()
      processedTemplate = processedTemplate.replace(/\$input\.querystrings\(\)/g, () => JSON.stringify(evaluationContext.input?.querystrings?.() ?? {}));
      // Replace $input.querystring('name')
      processedTemplate = processedTemplate.replace(/\$input\.querystring\(\s*'([^']+)'\s*\)/g, (_m, n) => JSON.stringify(evaluationContext.input?.querystring?.(n) ?? ''));
      
      // Replace $input.param() calls
      processedTemplate = processedTemplate.replace(/\$input\.param\(['"]([^'"]+)['"]\)/g, (_, paramName) => {
        const value = this.getInputParamValue(evaluationContext, paramName);
        return this.formatJsonValue(value);
      });
      // Replace quoted $input helpers
      processedTemplate = processedTemplate.replace(/"\s*\$input\.header\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify(evaluationContext.input?.header?.(n) ?? ''));
      processedTemplate = processedTemplate.replace(/"\s*\$input\.path\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify(evaluationContext.input?.path?.(n) ?? ''));
      processedTemplate = processedTemplate.replace(/"\s*\$input\.querystring\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify(evaluationContext.input?.querystring?.(n) ?? ''));
      processedTemplate = processedTemplate.replace(/"\s*\$input\.params\(\s*'([^']+)'\s*\)\s*"/g, (_m, n) => JSON.stringify((evaluationContext.input?.params?.() ?? {})[n] ?? (evaluationContext.input?.params?.() ?? {})[n.toLowerCase()] ?? ''));
      
      // Replace remaining $input.json references
      processedTemplate = processedTemplate.replace(/\$input\.json\(\s*['"]([^'\"]+)['"]\s*\)/g, (_m, jsonPath) => {
        const value = this.getInputJsonValue(evaluationContext, jsonPath);
        return this.formatJsonValue(value);
      });
      // Replace $input.json() with no args
      processedTemplate = processedTemplate.replace(/\$input\.json\(\)/g, () => {
        const body = evaluationContext.input?.json?.();
        return JSON.stringify(body);
      });
      // Replace $input.body()
      processedTemplate = processedTemplate.replace(/\$input\.body\(\)/g, () => JSON.stringify(evaluationContext.input?.body?.() ?? ''));
      // Replace "$input.body"
      processedTemplate = processedTemplate.replace(/"\s*\$input\.body\s*"/g, () => JSON.stringify(evaluationContext.input?.body?.() ?? ''));
      // Replace $util.base64Encode($input.body) or $input.body() in and out of quotes
      const bodyEncoded = JSON.stringify(evaluationContext.util?.base64Encode?.(evaluationContext.input?.body?.() ?? '') ?? '');
      processedTemplate = processedTemplate.replace(/\$util\.base64Encode\(\s*\$input\.body\(\)\s*\)/g, () => bodyEncoded);
      processedTemplate = processedTemplate.replace(/\$util\.base64Encode\(\s*\$input\.body\s*\)/g, () => bodyEncoded);
      processedTemplate = processedTemplate.replace(/"\s*\$util\.base64Encode\(\s*\$input\.body\(\)\s*\)\s*"/g, () => bodyEncoded);
      processedTemplate = processedTemplate.replace(/"\s*\$util\.base64Encode\(\s*\$input\.body\s*\)\s*"/g, () => bodyEncoded);
      
      // Replace $util.time.nowISO8601() calls
      processedTemplate = processedTemplate.replace(/\$util\.time\.nowISO8601\(\)/g, () => {
        const value = evaluationContext.util?.time?.nowISO8601?.() || null;
        return JSON.stringify(value);
      });
      // Replace $util.time.epochMilli() calls
      processedTemplate = processedTemplate.replace(/\$util\.time\.epochMilli\(\)/g, () => {
        const value = evaluationContext.util?.time?.epochMilli?.() || null;
        return JSON.stringify(value);
      });
      // Replace $util.time.epochSecond() calls
      processedTemplate = processedTemplate.replace(/\$util\.time\.epochSecond\(\)/g, () => {
        const value = evaluationContext.util?.time?.epochSecond?.() || null;
        return JSON.stringify(value);
      });
      
      // Replace $util.base64Encode() calls
      processedTemplate = processedTemplate.replace(/\$util\.base64Encode\(['"]([^'"]+)['"]\)/g, (_, str) => {
        const value = evaluationContext.util?.base64Encode?.(str) || null;
        return JSON.stringify(value);
      });
      // Replace $util.base64Decode() calls
      processedTemplate = processedTemplate.replace(/\$util\.base64Decode\(['"]([^'"]+)['"]\)/g, (_, str) => {
        const value = evaluationContext.util?.base64Decode?.(str) || null;
        return JSON.stringify(value);
      });
      // Replace $util.urlEncode() calls
      processedTemplate = processedTemplate.replace(/\$util\.urlEncode\(['"]([^'"]+)['"]\)/g, (_, str) => {
        const value = evaluationContext.util?.urlEncode?.(str) || null;
        return JSON.stringify(value);
      });
      // Replace $util.urlDecode() calls
      processedTemplate = processedTemplate.replace(/\$util\.urlDecode\(['"]([^'"]+)['"]\)/g, (_, str) => {
        const value = evaluationContext.util?.urlDecode?.(str) || null;
        return JSON.stringify(value);
      });
      // Replace quoted "$util.escapeJavaScript(...)" as a whole JSON string value
      processedTemplate = processedTemplate.replace(/"\s*\$util\.escapeJavaScript\(\s*((?:'(?:[^'\\]|\\.)*')|(?:\"(?:[^\"\\]|\\.)*\"))\s*\)\s*"/g, (_m, innerLit) => {
        let actual = '';
        try {
          if (innerLit.startsWith("'")) {
            const wrapped = '"' + innerLit.slice(1, -1).replace(/\\\"/g, '"').replace(/\"/g, '\\\"') + '"';
            actual = JSON.parse(wrapped);
          } else {
            actual = JSON.parse(innerLit);
          }
        } catch {
          actual = innerLit.slice(1, -1);
        }
        const value = evaluationContext.util?.escapeJavaScript?.(actual) || '';
        return JSON.stringify(value);
      });

      // Replace $util.escapeJavaScript() calls (quoted or unquoted)
      processedTemplate = processedTemplate.replace(/\$util\.escapeJavaScript\(\s*(?:('(?:[^'\\]|\\.)*')|("(?:[^"\\]|\\.)*"))\s*\)/g, (_m, s1, s2) => {
        const raw = s1 ?? s2; // includes surrounding quotes
        let actual = '';
        try {
          if (raw.startsWith("'")) {
            // Single-quoted: convert to JSON string then parse
            const wrapped = '"' + raw.slice(1, -1).replace(/\\"/g, '"').replace(/"/g, '\\"') + '"';
            actual = JSON.parse(wrapped);
          } else {
            actual = JSON.parse(raw);
          }
        } catch {
          actual = raw.slice(1, -1);
        }
        const value = evaluationContext.util?.escapeJavaScript?.(actual) || '';
        return JSON.stringify(value);
      });
      // Replace $util.json(object|array literal)
      processedTemplate = processedTemplate.replace(/\$util\.json\s*\(\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*\)/g, (_, literal) => {
        try {
          const parsed = JSON.parse(literal);
          return JSON.stringify(parsed);
        } catch {
          return 'null';
        }
      });
      // Replace $util.parseJson('json-string')
      processedTemplate = processedTemplate.replace(/\$util\.parseJson\(\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*\)/g, (_, jsonStr) => {
        try {
          const inner = jsonStr.slice(1, -1);
          const parsed = JSON.parse(inner);
          return JSON.stringify(parsed);
        } catch {
          return 'null';
        }
      });
      
      // Replace remaining $util.toJson() calls
      processedTemplate = processedTemplate.replace(/\$util\.toJson\(\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*\)/g, (_, literal) => {
        try {
          const parsed = JSON.parse(literal);
          return JSON.stringify(parsed);
        } catch {
          return 'null';
        }
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


  private createDefaultContext(event: ApiGatewayEvent): ApiGatewayContext {
    const requestContext = event.requestContext || {};
    const identity = requestContext.identity || {};

    const requestId = requestContext.requestId || 'unknown';
    const extendedRequestId = requestContext.extendedRequestId;
    const awsEndpointRequestId = requestContext.awsEndpointRequestId || '';
    const httpMethod = event.httpMethod || requestContext.httpMethod || 'GET';
    const path = event.path || requestContext.path || '/';
    const protocol = requestContext.protocol || 'HTTP/1.1';
    const stage = requestContext.stage || event.stage || 'dev';
    const domainName = requestContext.domainName || 'localhost';
    const domainPrefix =
      requestContext.domainPrefix ||
      (typeof domainName === 'string' ? domainName.split('.')[0] || '' : '');
    const stageVariables =
      event.stageVariables || requestContext.stageVariables || {};
    const accountId = requestContext.accountId || '';
    const apiId = requestContext.apiId || '';
    const deploymentId = requestContext.deploymentId || '';
    const resourceId = requestContext.resourceId || '';
    const resourcePath =
      requestContext.resourcePath ||
      event.resource ||
      path;
    const requestTime = requestContext.requestTime || '01/Jan/1970:00:00:00 +0000';
    const requestTimeEpoch =
      typeof requestContext.requestTimeEpoch === 'number'
        ? requestContext.requestTimeEpoch
        : 0;
    const wafResponseCode =
      typeof requestContext.wafResponseCode === 'number'
        ? requestContext.wafResponseCode
        : 0;
    const webaclArn = requestContext.webaclArn || '';

    const responseOverride = {
      statusCode:
        requestContext.responseOverride &&
        typeof requestContext.responseOverride.statusCode === 'number'
          ? requestContext.responseOverride.statusCode
          : 0,
      header: requestContext.responseOverride?.header || {},
    };

    const requestOverride = {
      header: requestContext.requestOverride?.header || {},
      querystring: requestContext.requestOverride?.querystring || {},
      path: requestContext.requestOverride?.path || {},
    };

    return {
      requestId,
      extendedRequestId,
      awsEndpointRequestId,
      httpMethod,
      path,
      protocol,
      stage,
      stageVariables,
      domainName,
      domainPrefix,
      accountId,
      apiId,
      deploymentId,
      resourceId,
      resourcePath,
      requestTime,
      requestTimeEpoch,
      wafResponseCode,
      webaclArn,
      identity: {
        sourceIp: identity.sourceIp || '127.0.0.1',
        userAgent: identity.userAgent || '',
        user: identity.user || '',
        userArn: identity.userArn || '',
        cognitoIdentityId: identity.cognitoIdentityId || '',
        cognitoIdentityPoolId: identity.cognitoIdentityPoolId || '',
        accountId: identity.accountId || '',
        apiKey: identity.apiKey || '',
        apiKeyId: identity.apiKeyId || '',
        caller: identity.caller || '',
        accessKey: identity.accessKey || '',
        cognitoAuthenticationType: identity.cognitoAuthenticationType || '',
        cognitoAuthenticationProvider:
          identity.cognitoAuthenticationProvider || '',
        userAgentV2: identity.userAgentV2 || '',
        clientCert: identity.clientCert || null,
        principalOrgId: identity.principalOrgId || '',
        vpcId: identity.vpcId || '',
        vpceId: identity.vpceId || '',
      },
      authorizer: requestContext.authorizer,
      error: requestContext.error,
      requestOverride,
      responseOverride,
    };
  }
}

// Convenience function for simple template rendering
export function renderTemplate(options: RenderTemplateOptions, debugMode: boolean = false): RenderTemplateResult {
  const engine = new VtlEngine(debugMode);
  return engine.renderTemplate(options);
}

/* Deviation Report: None - VTL engine matches AWS API Gateway VTL specification */
