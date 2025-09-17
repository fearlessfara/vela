/** AWS-SPEC: $context Provider | OWNER: vela | STATUS: READY */
export interface ContextProvider {
    requestId: string;
    extendedRequestId: string;
    httpMethod: string;
    path: string;
    protocol: string;
    stage: string;
    stageVariables: Record<string, string>;
    domainName: string;
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
    authorizer: {
        claims: Record<string, any>;
        scopes: string[];
        principalId: string;
        integrationLatency: number;
    };
    error: {
        message: string;
        messageString: string;
        statusCode: number;
    };
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
export declare function createContextProvider(context: ApiGatewayContext): ContextProvider;
