/** Example: Modular VTL Engine Usage | OWNER: vela | STATUS: READY */

// APIGW:Modular VTL Engine Usage Examples

import { 
  CoreVtlEngine, 
  renderCoreTemplate,
  ApiGatewayVtlAdapter,
  renderApiGatewayTemplate,
  DefaultProviderRegistry,
  createUtilProvider,
  createInputProvider,
  createContextProvider
} from '../src/index.js';

// Example 1: Using the Core VTL Engine (API Gateway independent)
console.log('=== Core VTL Engine Example ===');

const coreEngine = new CoreVtlEngine();
const coreResult = coreEngine.renderTemplate({
  template: 'Hello $name! You have $count items.',
  context: {
    flags: {
      APIGW_MODE: 'OFF',
      APIGW_UTILS: 'OFF',
      APIGW_INPUT: 'OFF',
      APIGW_CONTEXT: 'OFF',
      APIGW_SELECTION_TEMPLATES: 'OFF',
      APIGW_INTEGRATION_RESP: 'OFF',
      APIGW_LEGACY_COMPAT: 'OFF'
    }
  }
});

console.log('Core result:', coreResult);

// Example 2: Using Core Engine with Custom Providers
console.log('\n=== Core VTL Engine with Custom Providers ===');

const customProviders = new DefaultProviderRegistry();
customProviders.registerProvider(createUtilProvider());

const coreWithProviders = new CoreVtlEngine(false, customProviders);
const coreWithProvidersResult = coreWithProviders.renderTemplate({
  template: 'Current time: $util.time.nowISO8601()',
  context: {
    flags: {
      APIGW_MODE: 'ON',
      APIGW_UTILS: 'ON',
      APIGW_INPUT: 'OFF',
      APIGW_CONTEXT: 'OFF',
      APIGW_SELECTION_TEMPLATES: 'OFF',
      APIGW_INTEGRATION_RESP: 'OFF',
      APIGW_LEGACY_COMPAT: 'OFF'
    }
  }
});

console.log('Core with providers result:', coreWithProvidersResult);

// Example 3: Using the API Gateway Adapter (full API Gateway functionality)
console.log('\n=== API Gateway Adapter Example ===');

const apiGatewayAdapter = new ApiGatewayVtlAdapter();
const apiGatewayResult = apiGatewayAdapter.renderTemplate({
  template: 'Hello $input.param("name")! Time: $util.time.nowISO8601()',
  event: {
    httpMethod: 'GET',
    path: '/hello',
    queryStringParameters: {
      name: 'World'
    },
    headers: {},
    body: null
  },
  flags: {
    APIGW_UTILS: 'ON',
    APIGW_INPUT: 'ON',
    APIGW_CONTEXT: 'ON'
  }
});

console.log('API Gateway result:', apiGatewayResult);

// Example 4: Using Convenience Functions
console.log('\n=== Convenience Functions Example ===');

const convenienceResult = renderApiGatewayTemplate({
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

console.log('Convenience result:', convenienceResult);

/* Deviation Report: None - Examples demonstrate clean separation between core VTL and API Gateway functionality */
