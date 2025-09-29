/** AWS-SPEC: API Gateway VTL Adapter | OWNER: vela | STATUS: READY */

import { CoreVtlEngine, CoreRenderOptions } from '../core/engine.js';
import { ProviderRegistry, DefaultProviderRegistry, UtilProvider, InputProvider, ContextProvider } from '../core/providers.js';
import { createUtilProvider } from './util.js';
import { createInputProvider, ApiGatewayEvent } from './input.js';
import { createContextProvider, ApiGatewayContext } from './context.js';
import { FeatureFlags, DEFAULT_FLAGS, isFlagEnabled } from '../config/featureFlags.js';

// APIGW:API Gateway VTL Adapter

export interface ApiGatewayRenderOptions {
  template: string;
  event: ApiGatewayEvent;
  context?: ApiGatewayContext;
  flags?: Partial<FeatureFlags>;
}

export interface ApiGatewayRenderResult {
  output: string;
  errors: string[];
}

export class ApiGatewayVtlAdapter {
  private coreEngine: CoreVtlEngine;
  private providerRegistry: ProviderRegistry;

  constructor(debugMode: boolean = false) {
    this.providerRegistry = new DefaultProviderRegistry();
    this.coreEngine = new CoreVtlEngine(debugMode, this.providerRegistry);
  }

  renderTemplate(options: ApiGatewayRenderOptions): ApiGatewayRenderResult {
    const { template, event, context, flags = {} } = options;
    const mergedFlags = { ...DEFAULT_FLAGS, ...flags };

    // Create providers based on feature flags
    this.setupProviders(event, context, mergedFlags);

    // Create evaluation context
    const evaluationContext = this.createEvaluationContext(mergedFlags);

    // Render using core engine
    const coreOptions: CoreRenderOptions = {
      template,
      context: evaluationContext,
      providers: this.providerRegistry,
    };

    return this.coreEngine.renderTemplate(coreOptions);
  }

  private setupProviders(
    event: ApiGatewayEvent,
    context: ApiGatewayContext | undefined,
    flags: FeatureFlags
  ): void {
    // Clear existing providers
    this.providerRegistry.unregisterProvider('util');
    this.providerRegistry.unregisterProvider('input');
    this.providerRegistry.unregisterProvider('context');

    // Add $util provider if enabled
    if (isFlagEnabled(flags, 'APIGW_UTILS')) {
      const utilProvider = createUtilProvider() as UtilProvider;
      this.providerRegistry.registerProvider(utilProvider);
    }

    // Add $input provider if enabled
    if (isFlagEnabled(flags, 'APIGW_INPUT')) {
      const inputProvider = createInputProvider(event) as InputProvider;
      this.providerRegistry.registerProvider(inputProvider);
    }

    // Add $context provider if enabled
    if (isFlagEnabled(flags, 'APIGW_CONTEXT')) {
      const contextProvider = createContextProvider(context || this.createDefaultContext(event)) as ContextProvider;
      this.providerRegistry.registerProvider(contextProvider);
    }
  }

  private createEvaluationContext(flags: FeatureFlags) {
    return {
      flags,
    };
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
export function renderTemplate(options: ApiGatewayRenderOptions, debugMode: boolean = false): ApiGatewayRenderResult {
  const adapter = new ApiGatewayVtlAdapter(debugMode);
  return adapter.renderTemplate(options);
}

/* Deviation Report: None - API Gateway adapter provides clean separation between core VTL and API Gateway functionality */
