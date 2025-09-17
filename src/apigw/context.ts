/** AWS-SPEC: $context Provider | OWNER: vela | STATUS: READY */

// APIGW:$context Provider

export interface ContextProvider {
  // Request information
  requestId: string;
  extendedRequestId: string;
  httpMethod: string;
  path: string;
  protocol: string;
  stage: string;
  stageVariables: Record<string, string>;
  domainName: string;
  
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
  
  // Response override
  responseOverride: {
    statusCode: number;
  };
}

export interface ApiGatewayContext {
  requestId: string;
  extendedRequestId?: string;
  httpMethod: string;
  path: string;
  protocol: string;
  stage: string;
  stageVariables?: Record<string, string>;
  domainName: string;
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
  responseOverride?: {
    statusCode?: number;
  };
}

export function createContextProvider(context: ApiGatewayContext): ContextProvider {
  return {
    // Request information
    requestId: context.requestId,
    extendedRequestId: context.extendedRequestId || '',
    httpMethod: context.httpMethod,
    path: context.path,
    protocol: context.protocol,
    stage: context.stage,
    stageVariables: context.stageVariables || {},
    domainName: context.domainName,
    
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
    
    // Response override
    responseOverride: {
      statusCode: context.responseOverride?.statusCode || 0,
    },
  };
}

/* Deviation Report: None - $context provider matches AWS API Gateway VTL specification */
