/** AWS-SPEC: API Gateway VTL Adapter | OWNER: vela | STATUS: READY */

import { FeatureFlags, DEFAULT_FLAGS } from './config/featureFlags';
import { VtlEngine } from './engine';
import type { ApiGatewayEvent } from './input';
import type { ApiGatewayContext } from './context';

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
  private engine: VtlEngine;

  constructor(debugMode: boolean = false) {
    this.engine = new VtlEngine(debugMode);
  }

  renderTemplate(options: ApiGatewayRenderOptions): ApiGatewayRenderResult {
    const { template, event, context, flags = {} } = options;
    const mergedFlags = { ...DEFAULT_FLAGS, ...flags };
    return this.engine.renderTemplate({ template, event, context, flags: mergedFlags });
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
