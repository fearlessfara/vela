/** AWS-SPEC: API Gateway VTL Adapter Tests | OWNER: vela | STATUS: READY */

// APIGW:API Gateway VTL Adapter Tests

import { ApiGatewayVtlAdapter, renderTemplate as renderApiGatewayTemplate } from '../src/adapter';

const ALL_PROVIDERS_ON = {
  APIGW_CONTEXT: 'ON',
  APIGW_INPUT: 'ON',
  APIGW_UTILS: 'ON',
};

describe('ApiGatewayVtlAdapter', () => {
  it('evaluates velocity templates with context, input, and util providers when enabled', () => {
    const adapter = new ApiGatewayVtlAdapter();
    const template = 'Request: $context.requestId Query: $input.param("id") Encoded: $util.base64Encode("hi")';
    const event = {
      requestContext: { requestId: 'req-123' },
      queryStringParameters: { id: '42' },
    };

    const result = adapter.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Request: req-123 Query: 42 Encoded: aGk=');
  });

  it('renders JSON templates with provider lookups and formats values into valid JSON', () => {
    const adapter = new ApiGatewayVtlAdapter();
    const template = `{
      "requestId":"$context.requestId",
      "sourceIp":"$context.identity.sourceIp",
      "query":"$input.param('search')",
      "params": $input.params(),
      "jsonValue": $input.json('$.nested'),
      "missingPath": $input.json('$.missing'),
      "encoded": $util.base64Encode('ok')
    }`;
    const event = {
      body: JSON.stringify({ nested: { value: 5 } }),
      headers: { 'X-Test': 'value', Accept: 'text/plain' },
      pathParameters: { id: '123' },
      queryStringParameters: { search: 'test' },
      requestContext: { requestId: 'req-456', identity: { sourceIp: '1.1.1.1' } },
    };

    const result = adapter.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);

    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual({
      requestId: 'req-456',
      sourceIp: '1.1.1.1',
      query: 'test',
      params: {
        id: '123',
        search: 'test',
        'x-test': 'value',
        accept: 'text/plain',
      },
      jsonValue: { value: 5 },
      missingPath: null,
      encoded: 'b2s=',
    });
  });

  it('supplies default context fallbacks when no context is provided', () => {
    const template = `{
      "domain":"$context.domainName",
      "domainPrefix":"$context.domainPrefix",
      "deploymentId":"$context.deploymentId",
      "requestOverride": $util.toJson($context.requestOverride),
      "responseOverride": $util.toJson($context.responseOverride),
      "wafResponseCode": $context.wafResponseCode,
      "webaclArn":"$context.webaclArn",
      "identityVpcId":"$context.identity.vpcId",
      "identityVpceId":"$context.identity.vpceId",
      "requestTime":"$context.requestTime",
      "requestTimeEpoch": $context.requestTimeEpoch
    }`;

    const { output, errors } = renderApiGatewayTemplate({
      template,
      event: {},
      flags: { APIGW_CONTEXT: 'ON', APIGW_UTILS: 'ON' },
    });

    expect(errors).toEqual([]);
    expect(JSON.parse(output)).toEqual({
      domain: 'localhost',
      domainPrefix: 'localhost',
      deploymentId: '',
      requestOverride: {
        header: {},
        querystring: {},
        path: {},
      },
      responseOverride: {
        statusCode: 0,
        header: {},
      },
      wafResponseCode: 0,
      webaclArn: '',
      identityVpcId: '',
      identityVpceId: '',
      requestTime: '01/Jan/1970:00:00:00 +0000',
      requestTimeEpoch: 0,
    });
  });

  it('populates context fields from the incoming request when provided', () => {
    const template = `{
      "domain":"$context.domainName",
      "domainPrefix":"$context.domainPrefix",
      "deploymentId":"$context.deploymentId",
      "requestOverride": $util.toJson($context.requestOverride),
      "responseOverride": $util.toJson($context.responseOverride),
      "wafResponseCode": $context.wafResponseCode,
      "webaclArn":"$context.webaclArn",
      "identityVpcId":"$context.identity.vpcId",
      "identityVpceId":"$context.identity.vpceId",
      "requestTime":"$context.requestTime",
      "requestTimeEpoch": $context.requestTimeEpoch
    }`;

    const event = {
      requestContext: {
        requestId: 'req-ctx',
        httpMethod: 'POST',
        path: '/resource',
        protocol: 'HTTP/2',
        stage: 'prod',
        domainName: 'api.example.com',
        domainPrefix: 'api',
        deploymentId: 'dep-123',
        requestOverride: {
          header: { 'X-Test': 'yes' },
          querystring: { page: '1' },
          path: { id: '42' },
        },
        responseOverride: {
          statusCode: 202,
          header: { 'Content-Type': 'application/json' },
        },
        wafResponseCode: 403,
        webaclArn: 'arn:aws:wafv2:us-east-1:123:webacl/example',
        identity: {
          vpcId: 'vpc-123',
          vpceId: 'vpce-456',
          sourceIp: '1.1.1.1',
        },
        requestTime: '02/Feb/2024:10:20:30 +0000',
        requestTimeEpoch: 1706878830000,
      },
    };

    const { output, errors } = renderApiGatewayTemplate({
      template,
      event,
      flags: { APIGW_CONTEXT: 'ON', APIGW_UTILS: 'ON' },
    });

    expect(errors).toEqual([]);
    expect(JSON.parse(output)).toEqual({
      domain: 'api.example.com',
      domainPrefix: 'api',
      deploymentId: 'dep-123',
      requestOverride: {
        header: { 'X-Test': 'yes' },
        querystring: { page: '1' },
        path: { id: '42' },
      },
      responseOverride: {
        statusCode: 202,
        header: { 'Content-Type': 'application/json' },
      },
      wafResponseCode: 403,
      webaclArn: 'arn:aws:wafv2:us-east-1:123:webacl/example',
      identityVpcId: 'vpc-123',
      identityVpceId: 'vpce-456',
      requestTime: '02/Feb/2024:10:20:30 +0000',
      requestTimeEpoch: 1706878830000,
    });
  });

  it('prefers explicitly provided context over derived defaults', () => {
    const adapter = new ApiGatewayVtlAdapter();
    const template = 'Provided: $context.requestId';
    const explicitContext = {
      requestId: 'ctx-999',
      httpMethod: 'POST',
      path: '/items',
      protocol: 'HTTP/2',
      stage: 'test',
      domainName: 'ctx.example.com',
    };

    const result = adapter.renderTemplate({
      template,
      event: { requestContext: { requestId: 'event-123' } },
      context: explicitContext,
      flags: { APIGW_CONTEXT: 'ON' },
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Provided: ctx-999');
  });

  it('returns parser errors for invalid templates', () => {
    const adapter = new ApiGatewayVtlAdapter();
    const result = adapter.renderTemplate({
      template: '#set($value = )',
      event: {},
      flags: { APIGW_CONTEXT: 'ON' },
    });

    expect(result.output).toBe('');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('captures runtime errors raised during evaluation', () => {
    const adapter = new ApiGatewayVtlAdapter();
    const result = adapter.renderTemplate({
      template: '$util.error("boom")',
      event: {},
      flags: { APIGW_UTILS: 'ON' },
    });

    expect(result.output).toBe('');
    expect(result.errors).toEqual(['VTL Error: boom (Status: 500)']);
  });

  it('works with convenience function', () => {
    const result = renderApiGatewayTemplate({
      template: 'Request ID: $context.requestId',
      event: {
        httpMethod: 'POST',
        path: '/api/test',
        requestContext: {
          requestId: 'test-request-123'
        }
      },
      flags: {
        APIGW_CONTEXT: 'ON'
      }
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Request ID: test-request-123');
  });
});

/* Deviation Report: None - API Gateway adapter tests cover full API Gateway VTL functionality */
