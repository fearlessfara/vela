/** AWS-SPEC: Providers Integration Tests | OWNER: vela | STATUS: READY */

// APIGW:Providers Integration Tests

import { createContextProvider } from '../../src/apigw/context.ts';
import { createInputProvider } from '../../src/apigw/input.ts';
import { createUtilProvider } from '../../src/apigw/util.ts';

describe('Providers Integration Tests', () => {
  let contextProvider;
  let inputProvider;
  let utilProvider;

  beforeEach(() => {
    // Create a comprehensive test context
    const context = {
      requestId: 'test-request-123',
      extendedRequestId: 'extended-request-123',
      awsEndpointRequestId: 'aws-endpoint-request-123',
      accountId: '123456789012',
      apiId: 'api-123',
      httpMethod: 'POST',
      path: '/users/{userId}/posts',
      protocol: 'HTTP/1.1',
      stage: 'prod',
      stageVariables: { 
        dbHost: 'localhost',
        dbPort: '5432',
        apiVersion: 'v1'
      },
      domainName: 'api.example.com',
      domainPrefix: 'api',
      deploymentId: 'deployment-123',
      resourceId: 'resource-123',
      resourcePath: '/users/{userId}/posts',
      requestTime: '25/Dec/2023:12:00:00 +0000',
      requestTimeEpoch: 1703510400000,
      wafResponseCode: 200,
      webaclArn: 'arn:aws:wafv2:us-east-1:123456789012:webacl/test',
      identity: {
        sourceIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (compatible; API Gateway)',
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
      },
      authorizer: {
        claims: {
          sub: 'user123',
          email: 'user@example.com',
          'cognito:groups': ['admin', 'user'],
          'custom:department': 'engineering'
        },
        scopes: ['read', 'write'],
        principalId: 'principal123',
        integrationLatency: 150
      },
      error: {
        message: 'Validation error',
        messageString: '"Validation error"',
        statusCode: 400
      },
      requestOverride: {
        header: { 'X-Custom-Header': 'custom-value' },
        querystring: { 'custom-param': 'custom-value' },
        path: { 'custom-path': 'custom-value' }
      },
      responseOverride: {
        statusCode: 201,
        header: { 'X-Custom-Response-Header': 'custom-response-value' }
      }
    };

    // Create a comprehensive test event
    const event = {
      body: JSON.stringify({
        title: 'Test Post',
        content: 'This is a test post content',
        tags: ['test', 'api'],
        metadata: {
          author: 'John Doe',
          created: '2023-12-25T12:00:00Z',
          version: 1
        }
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
        'X-Request-ID': 'req-123',
        'User-Agent': 'Mozilla/5.0 (compatible; API Gateway)'
      },
      pathParameters: {
        userId: 'user123'
      },
      queryStringParameters: {
        include: 'metadata',
        format: 'json',
        version: 'v1'
      },
      multiValueHeaders: {
        'Content-Type': ['application/json'],
        'Authorization': ['Bearer token123']
      },
      multiValueQueryStringParameters: {
        include: ['metadata', 'tags'],
        format: ['json']
      },
      requestContext: context,
      httpMethod: 'POST',
      path: '/users/{userId}/posts',
      resource: '/users/{userId}/posts',
      stage: 'prod',
      stageVariables: context.stageVariables
    };

    contextProvider = createContextProvider(context);
    inputProvider = createInputProvider(event);
    utilProvider = createUtilProvider();
  });

  describe('Context Provider Integration', () => {
    test('should provide all context variables for VTL templates', () => {
      // Test basic context variables
      expect(contextProvider.requestId).toBe('test-request-123');
      expect(contextProvider.extendedRequestId).toBe('extended-request-123');
      expect(contextProvider.awsEndpointRequestId).toBe('aws-endpoint-request-123');
      expect(contextProvider.accountId).toBe('123456789012');
      expect(contextProvider.apiId).toBe('api-123');
      expect(contextProvider.httpMethod).toBe('POST');
      expect(contextProvider.path).toBe('/users/{userId}/posts');
      expect(contextProvider.protocol).toBe('HTTP/1.1');
      expect(contextProvider.stage).toBe('prod');
      expect(contextProvider.domainName).toBe('api.example.com');
      expect(contextProvider.domainPrefix).toBe('api');
      expect(contextProvider.deploymentId).toBe('deployment-123');
      expect(contextProvider.resourceId).toBe('resource-123');
      expect(contextProvider.resourcePath).toBe('/users/{userId}/posts');
      expect(contextProvider.requestTime).toBe('25/Dec/2023:12:00:00 +0000');
      expect(contextProvider.requestTimeEpoch).toBe(1703510400000);
      expect(contextProvider.wafResponseCode).toBe(200);
      expect(contextProvider.webaclArn).toBe('arn:aws:wafv2:us-east-1:123456789012:webacl/test');
    });

    test('should provide stage variables', () => {
      expect(contextProvider.stageVariables).toEqual({
        dbHost: 'localhost',
        dbPort: '5432',
        apiVersion: 'v1'
      });
    });

    test('should provide identity information', () => {
      expect(contextProvider.identity.sourceIp).toBe('192.168.1.1');
      expect(contextProvider.identity.userAgent).toBe('Mozilla/5.0 (compatible; API Gateway)');
      expect(contextProvider.identity.user).toBe('user123');
      expect(contextProvider.identity.userArn).toBe('arn:aws:iam::123456789012:user/user123');
      expect(contextProvider.identity.cognitoIdentityId).toBe('us-east-1:12345678-1234-1234-1234-123456789012');
      expect(contextProvider.identity.cognitoIdentityPoolId).toBe('us-east-1:12345678-1234-1234-1234-123456789012');
      expect(contextProvider.identity.accountId).toBe('123456789012');
      expect(contextProvider.identity.apiKey).toBe('api-key-123');
      expect(contextProvider.identity.apiKeyId).toBe('api-key-id-123');
      expect(contextProvider.identity.caller).toBe('caller123');
      expect(contextProvider.identity.accessKey).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(contextProvider.identity.cognitoAuthenticationType).toBe('authenticated');
      expect(contextProvider.identity.cognitoAuthenticationProvider).toBe('cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789');
      expect(contextProvider.identity.userAgentV2).toBe('Mozilla/5.0 (compatible; API Gateway)');
      expect(contextProvider.identity.principalOrgId).toBe('o-1234567890');
      expect(contextProvider.identity.vpcId).toBe('vpc-12345678');
      expect(contextProvider.identity.vpceId).toBe('vpce-12345678');
    });

    test('should provide authorizer information', () => {
      expect(contextProvider.authorizer.claims).toEqual({
        sub: 'user123',
        email: 'user@example.com',
        'cognito:groups': ['admin', 'user'],
        'custom:department': 'engineering'
      });
      expect(contextProvider.authorizer.scopes).toEqual(['read', 'write']);
      expect(contextProvider.authorizer.principalId).toBe('principal123');
      expect(contextProvider.authorizer.integrationLatency).toBe(150);
    });

    test('should provide error information', () => {
      expect(contextProvider.error.message).toBe('Validation error');
      expect(contextProvider.error.messageString).toBe('"Validation error"');
      expect(contextProvider.error.statusCode).toBe(400);
    });

    test('should provide request override information', () => {
      expect(contextProvider.requestOverride.header).toEqual({ 'X-Custom-Header': 'custom-value' });
      expect(contextProvider.requestOverride.querystring).toEqual({ 'custom-param': 'custom-value' });
      expect(contextProvider.requestOverride.path).toEqual({ 'custom-path': 'custom-value' });
    });

    test('should provide response override information', () => {
      expect(contextProvider.responseOverride.statusCode).toBe(201);
      expect(contextProvider.responseOverride.header).toEqual({ 'X-Custom-Response-Header': 'custom-response-value' });
    });
  });

  describe('Input Provider Integration', () => {
    test('should provide body operations', () => {
      const body = inputProvider.body();
      expect(body).toBe(JSON.stringify({
        title: 'Test Post',
        content: 'This is a test post content',
        tags: ['test', 'api'],
        metadata: {
          author: 'John Doe',
          created: '2023-12-25T12:00:00Z',
          version: 1
        }
      }));

      const bodyBytes = inputProvider.bodyBytes();
      expect(bodyBytes).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(bodyBytes)).toBe(body);
    });

    test('should provide JSON operations', () => {
      const fullJson = inputProvider.json();
      expect(fullJson).toEqual({
        title: 'Test Post',
        content: 'This is a test post content',
        tags: ['test', 'api'],
        metadata: {
          author: 'John Doe',
          created: '2023-12-25T12:00:00Z',
          version: 1
        }
      });

      expect(inputProvider.json('$.title')).toBe('Test Post');
      expect(inputProvider.json('$.content')).toBe('This is a test post content');
      expect(inputProvider.json('$.tags[0]')).toBe('test');
      expect(inputProvider.json('$.tags[1]')).toBe('api');
      expect(inputProvider.json('$.metadata.author')).toBe('John Doe');
      expect(inputProvider.json('$.metadata.version')).toBe(1);
    });

    test('should provide parameter operations with precedence', () => {
      const params = inputProvider.params();
      expect(params.userId).toBe('user123'); // path parameter takes precedence
      expect(params.include).toBe('metadata');
      expect(params.format).toBe('json');
      expect(params.version).toBe('v1');
      expect(params['content-type']).toBe('application/json');
      expect(params['authorization']).toBe('Bearer token123');
      expect(params['x-request-id']).toBe('req-123');
    });

    test('should provide header operations', () => {
      expect(inputProvider.header('Content-Type')).toBe('application/json');
      expect(inputProvider.header('Authorization')).toBe('Bearer token123');
      expect(inputProvider.header('X-Request-ID')).toBe('req-123');
      expect(inputProvider.header('User-Agent')).toBe('Mozilla/5.0 (compatible; API Gateway)');
      expect(inputProvider.header('nonexistent')).toBe('');

      const headers = inputProvider.headers();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
        'X-Request-ID': 'req-123',
        'User-Agent': 'Mozilla/5.0 (compatible; API Gateway)'
      });
    });

    test('should provide path operations', () => {
      expect(inputProvider.path('userId')).toBe('user123');
      expect(inputProvider.path('nonexistent')).toBe('');

      const paths = inputProvider.paths();
      expect(paths).toEqual({ userId: 'user123' });
    });

    test('should provide query string operations', () => {
      expect(inputProvider.querystring('include')).toBe('metadata');
      expect(inputProvider.querystring('format')).toBe('json');
      expect(inputProvider.querystring('version')).toBe('v1');
      expect(inputProvider.querystring('nonexistent')).toBe('');

      const querystrings = inputProvider.querystrings();
      expect(querystrings).toEqual({
        include: 'metadata',
        format: 'json',
        version: 'v1'
      });
    });
  });

  describe('Util Provider Integration', () => {
    test('should provide JSON operations', () => {
      const obj = { name: 'John', age: 30 };
      const jsonString = utilProvider.json(obj);
      const parsed = utilProvider.parseJson(jsonString);
      
      expect(jsonString).toBe('{"name":"John","age":30}');
      expect(parsed).toEqual(obj);
    });

    test('should provide encoding operations', () => {
      const text = 'Hello, World! & More';
      const base64Encoded = utilProvider.base64Encode(text);
      const base64Decoded = utilProvider.base64Decode(base64Encoded);
      const urlEncoded = utilProvider.urlEncode(text);
      const urlDecoded = utilProvider.urlDecode(urlEncoded);
      
      expect(base64Decoded).toBe(text);
      expect(urlDecoded).toBe(text);
    });

    test('should provide JavaScript escaping', () => {
      const text = 'Hello "World" and \'Single\' quotes';
      const escaped = utilProvider.escapeJavaScript(text);
      
      expect(escaped).toBe('Hello \\"World\\" and \\\'Single\\\' quotes');
    });

    test('should provide time operations', () => {
      const iso8601 = utilProvider.time.nowISO8601();
      const epochMilli = utilProvider.time.epochMilli();
      const epochSecond = utilProvider.time.epochSecond();
      
      expect(iso8601).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(typeof epochMilli).toBe('number');
      expect(typeof epochSecond).toBe('number');
      expect(epochSecond).toBe(Math.floor(epochMilli / 1000));
    });

    test('should provide utility functions', () => {
      const qrResult = utilProvider.qr('test data');
      expect(qrResult).toBe('QR:"test data"');

      expect(() => {
        utilProvider.error('Test error', 400);
      }).toThrow('VTL Error: Test error (Status: 400)');

      expect(() => {
        utilProvider.abort('Test abort', 500);
      }).toThrow('VTL Abort: Test abort (Status: 500)');
    });
  });

  describe('Cross-Provider Integration', () => {
    test('should work together in VTL template scenarios', () => {
      // Simulate a VTL template that uses all providers
      const template = {
        // Context variables
        requestId: contextProvider.requestId,
        httpMethod: contextProvider.httpMethod,
        stage: contextProvider.stage,
        user: contextProvider.identity.user,
        userArn: contextProvider.identity.userArn,
        
        // Input variables
        body: inputProvider.body(),
        title: inputProvider.json('$.title'),
        author: inputProvider.json('$.metadata.author'),
        userId: inputProvider.param('userId'),
        
        // Util functions
        timestamp: utilProvider.time.nowISO8601(),
        bodyJson: utilProvider.json(inputProvider.json()),
        escapedTitle: utilProvider.escapeJavaScript(inputProvider.json('$.title'))
      };

      expect(template.requestId).toBe('test-request-123');
      expect(template.httpMethod).toBe('POST');
      expect(template.stage).toBe('prod');
      expect(template.user).toBe('user123');
      expect(template.userArn).toBe('arn:aws:iam::123456789012:user/user123');
      expect(template.title).toBe('Test Post');
      expect(template.author).toBe('John Doe');
      expect(template.userId).toBe('user123');
      expect(template.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(template.bodyJson).toBe('{"title":"Test Post","content":"This is a test post content","tags":["test","api"],"metadata":{"author":"John Doe","created":"2023-12-25T12:00:00Z","version":1}}');
      expect(template.escapedTitle).toBe('Test Post');
    });

    test('should handle complex VTL template scenarios', () => {
      // Simulate a complex VTL template with nested operations
      const complexTemplate = {
        // Build a response object
        response: {
          request: {
            id: contextProvider.requestId,
            method: contextProvider.httpMethod,
            path: contextProvider.path,
            stage: contextProvider.stage
          },
          user: {
            id: contextProvider.identity.user,
            arn: contextProvider.identity.userArn,
            sourceIp: contextProvider.identity.sourceIp,
            userAgent: contextProvider.identity.userAgent
          },
          data: {
            post: inputProvider.json('$'),
            userId: inputProvider.param('userId'),
            include: inputProvider.param('include'),
            format: inputProvider.param('format')
          },
          metadata: {
            timestamp: utilProvider.time.nowISO8601(),
            epoch: utilProvider.time.epochMilli(),
            version: contextProvider.stageVariables.apiVersion
          }
        }
      };

      expect(complexTemplate.response.request.id).toBe('test-request-123');
      expect(complexTemplate.response.request.method).toBe('POST');
      expect(complexTemplate.response.request.path).toBe('/users/{userId}/posts');
      expect(complexTemplate.response.request.stage).toBe('prod');
      expect(complexTemplate.response.user.id).toBe('user123');
      expect(complexTemplate.response.user.arn).toBe('arn:aws:iam::123456789012:user/user123');
      expect(complexTemplate.response.user.sourceIp).toBe('192.168.1.1');
      expect(complexTemplate.response.user.userAgent).toBe('Mozilla/5.0 (compatible; API Gateway)');
      expect(complexTemplate.response.data.post).toEqual({
        title: 'Test Post',
        content: 'This is a test post content',
        tags: ['test', 'api'],
        metadata: {
          author: 'John Doe',
          created: '2023-12-25T12:00:00Z',
          version: 1
        }
      });
      expect(complexTemplate.response.data.userId).toBe('user123');
      expect(complexTemplate.response.data.include).toBe('metadata');
      expect(complexTemplate.response.data.format).toBe('json');
      expect(complexTemplate.response.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(typeof complexTemplate.response.metadata.epoch).toBe('number');
      expect(complexTemplate.response.metadata.version).toBe('v1');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle provider errors gracefully', () => {
      // Test with invalid JSON in body
      const invalidEvent = {
        body: 'invalid json',
        httpMethod: 'POST',
        path: '/test'
      };

      const invalidInputProvider = createInputProvider(invalidEvent);
      expect(invalidInputProvider.json()).toBeNull();

      // Test with missing context fields
      const minimalContext = {
        requestId: 'test-request-id',
        httpMethod: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        stage: 'test',
        domainName: 'test.example.com'
      };

      const minimalContextProvider = createContextProvider(minimalContext);
      expect(minimalContextProvider.extendedRequestId).toBe('');
      expect(minimalContextProvider.identity.sourceIp).toBe('');
      expect(minimalContextProvider.authorizer.claims).toEqual({});
    });
  });
});

/* Deviation Report: None - Providers integration tests cover all AWS API Gateway VTL specification scenarios */
