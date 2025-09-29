/** AWS-SPEC: $input Provider Unit Tests | OWNER: vela | STATUS: READY */

// APIGW:$input Provider Unit Tests

import { createInputProvider } from '../src/input';

describe('$input Provider Unit Tests', () => {
  describe('Body Operations', () => {
    test('should return body as string', () => {
      const event = {
        body: '{"test": "value"}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.body()).toBe('{"test": "value"}');
    });

    test('should return empty string when body is undefined', () => {
      const event = {
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.body()).toBe('');
    });

    test('should return body as Uint8Array', () => {
      const event = {
        body: '{"test": "value"}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const bodyBytes = provider.bodyBytes();
      expect(bodyBytes).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(bodyBytes)).toBe('{"test": "value"}');
    });
  });

  describe('JSON Operations', () => {
    test('should parse JSON body without path', () => {
      const event = {
        body: '{"name": "John", "age": 30}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const result = provider.json();
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    test('should return null for invalid JSON', () => {
      const event = {
        body: 'invalid json',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const result = provider.json();
      expect(result).toBeNull();
    });

    test('should return null for empty body', () => {
      const event = {
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const result = provider.json();
      expect(result).toBeNull();
    });

    test('should extract JSON path values', () => {
      const event = {
        body: '{"user": {"name": "John", "age": 30}, "items": [{"id": 1, "name": "item1"}]}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.user.name')).toBe('John');
      expect(provider.json('$.user.age')).toBe(30);
      expect(provider.json('$.items[0].id')).toBe(1);
      expect(provider.json('$.items[0].name')).toBe('item1');
      expect(provider.json('$')).toEqual({
        user: { name: 'John', age: 30 },
        items: [{ id: 1, name: 'item1' }]
      });
    });

    test('should return null for invalid JSON path', () => {
      const event = {
        body: '{"user": {"name": "John"}}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.user.invalid')).toBeNull();
      expect(provider.json('$.user[0]')).toBeNull();
    });
  });

  describe('Parameter Operations', () => {
    test('should return all parameters with precedence (path > querystring > header)', () => {
      const event = {
        pathParameters: { id: '123' },
        queryStringParameters: { id: '456', filter: 'active' },
        headers: { 'X-Custom-Header': 'custom-value', 'Content-Type': 'application/json' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const params = provider.params();
      expect(params.id).toBe('123'); // path parameter takes precedence
      expect(params.filter).toBe('active');
      expect(params['x-custom-header']).toBe('custom-value');
      expect(params['content-type']).toBe('application/json');
    });

    test('should return specific parameter by name', () => {
      const event = {
        pathParameters: { id: '123' },
        queryStringParameters: { filter: 'active' },
        headers: { 'X-Custom-Header': 'custom-value' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.param('id')).toBe('123');
      expect(provider.param('filter')).toBe('active');
      expect(provider.param('x-custom-header')).toBe('custom-value');
      expect(provider.param('X-Custom-Header')).toBe('custom-value'); // case insensitive
      expect(provider.param('nonexistent')).toBe('');
    });

    test('should handle case-insensitive header lookup', () => {
      const event = {
        headers: { 'Content-Type': 'application/json', 'X-Custom-Header': 'custom-value' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.param('content-type')).toBe('application/json');
      expect(provider.param('CONTENT-TYPE')).toBe('application/json');
      expect(provider.param('Content-Type')).toBe('application/json');
      expect(provider.param('x-custom-header')).toBe('custom-value');
    });
  });

  describe('Header Operations', () => {
    test('should return specific header by name (case-insensitive)', () => {
      const event = {
        headers: { 'Content-Type': 'application/json', 'X-Custom-Header': 'custom-value' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.header('Content-Type')).toBe('application/json');
      expect(provider.header('content-type')).toBe('application/json');
      expect(provider.header('CONTENT-TYPE')).toBe('application/json');
      expect(provider.header('X-Custom-Header')).toBe('custom-value');
      expect(provider.header('nonexistent')).toBe('');
    });

    test('should return all headers', () => {
      const event = {
        headers: { 'Content-Type': 'application/json', 'X-Custom-Header': 'custom-value' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const headers = provider.headers();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value'
      });
    });

    test('should return empty string for missing headers', () => {
      const event = {
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.header('Content-Type')).toBe('');
      expect(provider.headers()).toEqual({});
    });
  });

  describe('Path Operations', () => {
    test('should return specific path parameter by name', () => {
      const event = {
        pathParameters: { id: '123', name: 'test' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.path('id')).toBe('123');
      expect(provider.path('name')).toBe('test');
      expect(provider.path('nonexistent')).toBe('');
    });

    test('should return all path parameters', () => {
      const event = {
        pathParameters: { id: '123', name: 'test' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const paths = provider.paths();
      expect(paths).toEqual({ id: '123', name: 'test' });
    });

    test('should return empty string for missing path parameters', () => {
      const event = {
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.path('id')).toBe('');
      expect(provider.paths()).toEqual({});
    });
  });

  describe('Query String Operations', () => {
    test('should return specific query string parameter by name', () => {
      const event = {
        queryStringParameters: { filter: 'active', sort: 'name' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.querystring('filter')).toBe('active');
      expect(provider.querystring('sort')).toBe('name');
      expect(provider.querystring('nonexistent')).toBe('');
    });

    test('should return all query string parameters', () => {
      const event = {
        queryStringParameters: { filter: 'active', sort: 'name' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      const querystrings = provider.querystrings();
      expect(querystrings).toEqual({ filter: 'active', sort: 'name' });
    });

    test('should return empty string for missing query string parameters', () => {
      const event = {
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.querystring('filter')).toBe('');
      expect(provider.querystrings()).toEqual({});
    });
  });

  describe('JSONPath Subset Implementation', () => {
    test('should handle root path', () => {
      const event = {
        body: '{"name": "John", "age": 30}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$')).toEqual({ name: 'John', age: 30 });
    });

    test('should handle dot notation', () => {
      const event = {
        body: '{"user": {"profile": {"name": "John"}}}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.user.profile.name')).toBe('John');
    });

    test('should handle array access', () => {
      const event = {
        body: '{"items": [{"id": 1}, {"id": 2}, {"id": 3}]}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.items[0].id')).toBe(1);
      expect(provider.json('$.items[1].id')).toBe(2);
      expect(provider.json('$.items[2].id')).toBe(3);
    });

    test('should handle nested array access', () => {
      const event = {
        body: '{"data": {"users": [{"name": "John"}, {"name": "Jane"}]}}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.data.users[0].name')).toBe('John');
      expect(provider.json('$.data.users[1].name')).toBe('Jane');
    });

    test('should return null for invalid array access', () => {
      const event = {
        body: '{"items": [{"id": 1}]}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.items[1]')).toBeNull();
      expect(provider.json('$.items[0].invalid')).toBeNull();
    });

    test('should handle missing intermediate properties', () => {
      const event = {
        body: '{"user": {"name": "John"}}',
        httpMethod: 'POST',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json('$.user.profile.name')).toBeNull();
      expect(provider.json('$.nonexistent.property')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined values gracefully', () => {
      const event = {
        body: null,
        headers: null,
        pathParameters: null,
        queryStringParameters: null,
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.body()).toBe('');
      expect(provider.headers()).toEqual({});
      expect(provider.paths()).toEqual({});
      expect(provider.querystrings()).toEqual({});
      expect(provider.json()).toBeNull();
    });

    test('should handle empty objects and arrays', () => {
      const event = {
        body: '{}',
        headers: {},
        pathParameters: {},
        queryStringParameters: {},
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.json()).toEqual({});
      expect(provider.headers()).toEqual({});
      expect(provider.paths()).toEqual({});
      expect(provider.querystrings()).toEqual({});
    });

    test('should handle special characters in parameter names', () => {
      const event = {
        pathParameters: { 'param-with-dash': 'value1', 'param_with_underscore': 'value2' },
        queryStringParameters: { 'param.with.dots': 'value3' },
        headers: { 'X-Special-Header': 'value4' },
        httpMethod: 'GET',
        path: '/test'
      };

      const provider = createInputProvider(event);

      expect(provider.param('param-with-dash')).toBe('value1');
      expect(provider.param('param_with_underscore')).toBe('value2');
      expect(provider.param('param.with.dots')).toBe('value3');
      expect(provider.param('x-special-header')).toBe('value4');
    });
  });
});

/* Deviation Report: None - $input provider unit tests cover all AWS API Gateway VTL specification fields */
