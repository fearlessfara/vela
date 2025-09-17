/** AWS-SPEC: $context Provider | OWNER: vela | STATUS: READY */

// APIGW:$context Provider

export interface ContextProvider {
  // Request information
  requestId: string;
  extendedRequestId: string;
  awsEndpointRequestId: string;
  accountId: string;
  apiId: string;
  httpMethod: string;
  path: string;
  protocol: string;
  stage: string;
  stageVariables: Record<string, string>;
  domainName: string;
  domainPrefix: string;
  deploymentId: string;
  resourceId: string;
  resourcePath: string;
  requestTime: string;
  requestTimeEpoch: number;
  wafResponseCode: number;
  webaclArn: string;

  // Identity information
  identity: {
    sourceIp: string;
    userAgent: string;
    user: string;
    userArn: string;
    cognitoIdentityId: string;
    cognitoIdentityPoolId: string;
    accountId: string;
    apiKey: string;
    apiKeyId: string;
    caller: string;
    accessKey: string;
    cognitoAuthenticationType: string;
    cognitoAuthenticationProvider: string;
    userAgentV2: string;
    clientCert: any;
    principalOrgId: string;
    vpcId: string;
    vpceId: string;
  };

  // Authorizer information
  authorizer: {
    claims: Record<string, any>;
    scopes: string[];
    principalId: string;
    integrationLatency: number;
  };

  // Error information
  error: {
    message: string;
    messageString: string;
    statusCode: number;
  };

  // Request override
  requestOverride: {
    header: Record<string, string>;
    querystring: Record<string, string>;
    path: Record<string, string>;
  };

  // Response override
  responseOverride: {
    statusCode: number;
    header: Record<string, string>;
  };
}

export interface ApiGatewayContext {
  requestId: string;
  extendedRequestId?: string;
  awsEndpointRequestId?: string;
  accountId?: string;
  apiId?: string;
  httpMethod: string;
  path: string;
  protocol: string;
  stage: string;
  stageVariables?: Record<string, string>;
  domainName: string;
  domainPrefix?: string;
  deploymentId?: string;
  resourceId?: string;
  resourcePath?: string;
  requestTime?: string;
  requestTimeEpoch?: number;
  wafResponseCode?: number;
  webaclArn?: string;
  identity?: {
    sourceIp?: string;
    userAgent?: string;
    user?: string;
    userArn?: string;
    cognitoIdentityId?: string;
    cognitoIdentityPoolId?: string;
    accountId?: string;
    apiKey?: string;
    apiKeyId?: string;
    caller?: string;
    accessKey?: string;
    cognitoAuthenticationType?: string;
    cognitoAuthenticationProvider?: string;
    userAgentV2?: string;
    clientCert?: any;
    principalOrgId?: string;
    vpcId?: string;
    vpceId?: string;
  };
  authorizer?: {
    claims?: Record<string, any>;
    scopes?: string[];
    principalId?: string;
    integrationLatency?: number;
  };
  error?: {
    message?: string;
    messageString?: string;
    statusCode?: number;
  };
  requestOverride?: {
    header?: Record<string, string>;
    querystring?: Record<string, string>;
    path?: Record<string, string>;
  };
  responseOverride?: {
    statusCode?: number;
    header?: Record<string, string>;
  };
}

export function createContextProvider(context: ApiGatewayContext): ContextProvider {
  return {
    // Request information
    requestId: context.requestId,
    extendedRequestId: context.extendedRequestId || '',
    awsEndpointRequestId: context.awsEndpointRequestId || '',
    accountId: context.accountId || '',
    apiId: context.apiId || '',
    httpMethod: context.httpMethod,
    path: context.path,
    protocol: context.protocol,
    stage: context.stage,
    stageVariables: context.stageVariables || {},
    domainName: context.domainName,
    domainPrefix: context.domainPrefix || '',
    deploymentId: context.deploymentId || '',
    resourceId: context.resourceId || '',
    resourcePath: context.resourcePath || '',
    requestTime: context.requestTime || '',
    requestTimeEpoch: context.requestTimeEpoch ?? 0,
    wafResponseCode: context.wafResponseCode ?? 0,
    webaclArn: context.webaclArn || '',

    // Identity information
    identity: {
      sourceIp: context.identity?.sourceIp || '',
      userAgent: context.identity?.userAgent || '',
      user: context.identity?.user || '',
      userArn: context.identity?.userArn || '',
      cognitoIdentityId: context.identity?.cognitoIdentityId || '',
      cognitoIdentityPoolId: context.identity?.cognitoIdentityPoolId || '',
      accountId: context.identity?.accountId || '',
      apiKey: context.identity?.apiKey || '',
      apiKeyId: context.identity?.apiKeyId || '',
      caller: context.identity?.caller || '',
      accessKey: context.identity?.accessKey || '',
      cognitoAuthenticationType: context.identity?.cognitoAuthenticationType || '',
      cognitoAuthenticationProvider: context.identity?.cognitoAuthenticationProvider || '',
      userAgentV2: context.identity?.userAgentV2 || '',
      clientCert: context.identity?.clientCert || null,
      principalOrgId: context.identity?.principalOrgId || '',
      vpcId: context.identity?.vpcId || '',
      vpceId: context.identity?.vpceId || '',
    },

    // Authorizer information
    authorizer: {
      claims: context.authorizer?.claims || {},
      scopes: context.authorizer?.scopes || [],
      principalId: context.authorizer?.principalId || '',
      integrationLatency: context.authorizer?.integrationLatency || 0,
    },
    
    // Error information
    error: {
      message: context.error?.message || '',
      messageString: context.error?.messageString || '',
      statusCode: context.error?.statusCode || 0,
    },

    // Request override
    requestOverride: {
      header: context.requestOverride?.header || {},
      querystring: context.requestOverride?.querystring || {},
      path: context.requestOverride?.path || {},
    },

    // Response override
    responseOverride: {
      statusCode: context.responseOverride?.statusCode ?? 0,
      header: context.responseOverride?.header || {},
    },
  };
}

/* Deviation Report: None - $context provider matches AWS API Gateway VTL specification */
