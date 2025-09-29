/** AWS-SPEC: $context Provider Unit Tests | OWNER: vela | STATUS: READY */

// APIGW:$context Provider Unit Tests

import { createContextProvider } from '../src/context';

describe('$context Provider Unit Tests', () => {
  describe('Basic Context Properties', () => {
    test('should create context provider with minimal required fields', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.requestId).toBe('test-request-id');
      expect(provider.httpMethod).toBe('GET');
      expect(provider.path).toBe('/test');
      expect(provider.protocol).toBe('HTTP/1.1');
      expect(provider.stage).toBe('test');
      expect(provider.domainName).toBe('test.example.com');
    });

    test('should handle optional context fields with defaults', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.extendedRequestId).toBe('');
      expect(provider.awsEndpointRequestId).toBe('');
      expect(provider.accountId).toBe('');
      expect(provider.apiId).toBe('');
      expect(provider.domainPrefix).toBe('');
      expect(provider.deploymentId).toBe('');
      expect(provider.resourceId).toBe('');
      expect(provider.resourcePath).toBe('');
      expect(provider.requestTime).toBe('');
      expect(provider.requestTimeEpoch).toBe(0);
      expect(provider.wafResponseCode).toBe(0);
      expect(provider.webaclArn).toBe('');
    });

    test('should handle all optional context fields when provided', () => {
      const context = {
        requestId: 'test-request-id',
        extendedRequestId: 'extended-request-id',
        awsEndpointRequestId: 'aws-endpoint-request-id',
        accountId: '123456789012',
        apiId: 'api-id-123',
        httpMethod: 'POST',
        path: '/test/path',
        protocol: 'HTTP/1.1',
        stage: 'prod',
        stageVariables: { var1: 'value1', var2: 'value2' },
        domainName: 'api.example.com',
        domainPrefix: 'api',
        deploymentId: 'deployment-123',
        resourceId: 'resource-123',
        resourcePath: '/test/path',
        requestTime: '25/Dec/2023:12:00:00 +0000',
        requestTimeEpoch: 1703510400000,
        wafResponseCode: 200,
        webaclArn: 'arn:aws:wafv2:us-east-1:123456789012:webacl/test'
      };

      const provider = createContextProvider(context);

      expect(provider.extendedRequestId).toBe('extended-request-id');
      expect(provider.awsEndpointRequestId).toBe('aws-endpoint-request-id');
      expect(provider.accountId).toBe('123456789012');
      expect(provider.apiId).toBe('api-id-123');
      expect(provider.domainPrefix).toBe('api');
      expect(provider.deploymentId).toBe('deployment-123');
      expect(provider.resourceId).toBe('resource-123');
      expect(provider.resourcePath).toBe('/test/path');
      expect(provider.requestTime).toBe('25/Dec/2023:12:00:00 +0000');
      expect(provider.requestTimeEpoch).toBe(1703510400000);
      expect(provider.wafResponseCode).toBe(200);
      expect(provider.webaclArn).toBe('arn:aws:wafv2:us-east-1:123456789012:webacl/test');
      expect(provider.stageVariables).toEqual({ var1: 'value1', var2: 'value2' });
    });
  });

  describe('Identity Properties', () => {
    test('should handle identity fields with defaults', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.identity.sourceIp).toBe('');
      expect(provider.identity.userAgent).toBe('');
      expect(provider.identity.user).toBe('');
      expect(provider.identity.userArn).toBe('');
      expect(provider.identity.cognitoIdentityId).toBe('');
      expect(provider.identity.cognitoIdentityPoolId).toBe('');
      expect(provider.identity.accountId).toBe('');
      expect(provider.identity.apiKey).toBe('');
      expect(provider.identity.apiKeyId).toBe('');
      expect(provider.identity.caller).toBe('');
      expect(provider.identity.accessKey).toBe('');
      expect(provider.identity.cognitoAuthenticationType).toBe('');
      expect(provider.identity.cognitoAuthenticationProvider).toBe('');
      expect(provider.identity.userAgentV2).toBe('');
      expect(provider.identity.clientCert).toBe(null);
      expect(provider.identity.principalOrgId).toBe('');
      expect(provider.identity.vpcId).toBe('');
      expect(provider.identity.vpceId).toBe('');
    });

    test('should handle all identity fields when provided', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        identity: {
          sourceIp: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          user: 'user123',
          userArn: 'arn:aws:iam::123456789012:user/user123',
          cognitoIdentityId: 'us-east-1:12345678-1234-1234-1234-123456789012',
          cognitoIdentityPoolId: 'us-east-1:12345678-1234-1234-1234-123456789012',
          accountId: '123456789012',
          apiKey: 'api-key-123',
          apiKeyId: 'api-key-id-123',
          caller: 'caller123',
          accessKey: 'AKIAIOSFODNN7EXAMPLE',
          cognitoAuthenticationType: 'authenticated',
          cognitoAuthenticationProvider: 'cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789',
          userAgentV2: 'Mozilla/5.0 (compatible; API Gateway)',
          clientCert: {
            clientCertPem: '-----BEGIN CERTIFICATE-----',
            subjectDN: 'CN=test.example.com',
            issuerDN: 'CN=Test CA',
            serialNumber: '1234567890',
            validity: {
              notBefore: '2023-01-01T00:00:00Z',
              notAfter: '2024-01-01T00:00:00Z'
            }
          },
          principalOrgId: 'o-1234567890',
          vpcId: 'vpc-12345678',
          vpceId: 'vpce-12345678'
        }
      };

      const provider = createContextProvider(context);

      expect(provider.identity.sourceIp).toBe('192.168.1.1');
      expect(provider.identity.userAgent).toBe('Mozilla/5.0');
      expect(provider.identity.user).toBe('user123');
      expect(provider.identity.userArn).toBe('arn:aws:iam::123456789012:user/user123');
      expect(provider.identity.cognitoIdentityId).toBe('us-east-1:12345678-1234-1234-1234-123456789012');
      expect(provider.identity.cognitoIdentityPoolId).toBe('us-east-1:12345678-1234-1234-1234-123456789012');
      expect(provider.identity.accountId).toBe('123456789012');
      expect(provider.identity.apiKey).toBe('api-key-123');
      expect(provider.identity.apiKeyId).toBe('api-key-id-123');
      expect(provider.identity.caller).toBe('caller123');
      expect(provider.identity.accessKey).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(provider.identity.cognitoAuthenticationType).toBe('authenticated');
      expect(provider.identity.cognitoAuthenticationProvider).toBe('cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789');
      expect(provider.identity.userAgentV2).toBe('Mozilla/5.0 (compatible; API Gateway)');
      expect(provider.identity.clientCert).toEqual({
        clientCertPem: '-----BEGIN CERTIFICATE-----',
        subjectDN: 'CN=test.example.com',
        issuerDN: 'CN=Test CA',
        serialNumber: '1234567890',
        validity: {
          notBefore: '2023-01-01T00:00:00Z',
          notAfter: '2024-01-01T00:00:00Z'
        }
      });
      expect(provider.identity.principalOrgId).toBe('o-1234567890');
      expect(provider.identity.vpcId).toBe('vpc-12345678');
      expect(provider.identity.vpceId).toBe('vpce-12345678');
    });
  });

  describe('Authorizer Properties', () => {
    test('should handle authorizer fields with defaults', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.authorizer.claims).toEqual({});
      expect(provider.authorizer.scopes).toEqual([]);
      expect(provider.authorizer.principalId).toBe('');
      expect(provider.authorizer.integrationLatency).toBe(0);
    });

    test('should handle authorizer fields when provided', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        authorizer: {
          claims: {
            sub: 'user123',
            email: 'user@example.com',
            'cognito:groups': ['admin', 'user']
          },
          scopes: ['read', 'write'],
          principalId: 'principal123',
          integrationLatency: 150
        }
      };

      const provider = createContextProvider(context);

      expect(provider.authorizer.claims).toEqual({
        sub: 'user123',
        email: 'user@example.com',
        'cognito:groups': ['admin', 'user']
      });
      expect(provider.authorizer.scopes).toEqual(['read', 'write']);
      expect(provider.authorizer.principalId).toBe('principal123');
      expect(provider.authorizer.integrationLatency).toBe(150);
    });
  });

  describe('Error Properties', () => {
    test('should handle error fields with defaults', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.error.message).toBe('');
      expect(provider.error.messageString).toBe('');
      expect(provider.error.statusCode).toBe(0);
    });

    test('should handle error fields when provided', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        error: {
          message: 'Validation error',
          messageString: '"Validation error"',
          statusCode: 400
        }
      };

      const provider = createContextProvider(context);

      expect(provider.error.message).toBe('Validation error');
      expect(provider.error.messageString).toBe('"Validation error"');
      expect(provider.error.statusCode).toBe(400);
    });
  });

  describe('Request Override Properties', () => {
    test('should handle request override fields with defaults', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.requestOverride.header).toEqual({});
      expect(provider.requestOverride.querystring).toEqual({});
      expect(provider.requestOverride.path).toEqual({});
    });

    test('should handle request override fields when provided', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        requestOverride: {
          header: { 'X-Custom-Header': 'custom-value' },
          querystring: { 'custom-param': 'custom-value' },
          path: { 'custom-path': 'custom-value' }
        }
      };

      const provider = createContextProvider(context);

      expect(provider.requestOverride.header).toEqual({ 'X-Custom-Header': 'custom-value' });
      expect(provider.requestOverride.querystring).toEqual({ 'custom-param': 'custom-value' });
      expect(provider.requestOverride.path).toEqual({ 'custom-path': 'custom-value' });
    });
  });

  describe('Response Override Properties', () => {
    test('should handle response override fields with defaults', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const provider = createContextProvider(context);

      expect(provider.responseOverride.statusCode).toBe(0);
      expect(provider.responseOverride.header).toEqual({});
    });

    test('should handle response override fields when provided', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        responseOverride: {
          statusCode: 201,
          header: { 'X-Custom-Response-Header': 'custom-response-value' }
        }
      };

      const provider = createContextProvider(context);

      expect(provider.responseOverride.statusCode).toBe(201);
      expect(provider.responseOverride.header).toEqual({ 'X-Custom-Response-Header': 'custom-response-value' });
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined values gracefully', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        identity: {
          clientCert: null
        },
        authorizer: {
          claims: null
        }
      };

      const provider = createContextProvider(context);

      expect(provider.identity.clientCert).toBe(null);
      expect(provider.authorizer.claims).toEqual({});
    });

    test('should handle empty objects and arrays', () => {
      const context = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com',
        stageVariables: {},
        authorizer: {
          claims: {},
          scopes: []
        }
      };

      const provider = createContextProvider(context);

      expect(provider.stageVariables).toEqual({});
      expect(provider.authorizer.claims).toEqual({});
      expect(provider.authorizer.scopes).toEqual([]);
    });
  });
});

/* Deviation Report: None - $context provider unit tests cover all AWS API Gateway VTL specification fields */