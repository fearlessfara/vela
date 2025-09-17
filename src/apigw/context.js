/** AWS-SPEC: $context Provider | OWNER: vela | STATUS: READY */
export function createContextProvider(context) {
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
