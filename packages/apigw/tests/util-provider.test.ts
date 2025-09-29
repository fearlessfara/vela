/** AWS-SPEC: $util Provider Unit Tests | OWNER: vela | STATUS: READY */

// APIGW:$util Provider Unit Tests

import { createUtilProvider } from '../src/util';
import { vi } from 'vitest';

describe('$util Provider Unit Tests', () => {
  let provider;

  beforeEach(() => {
    provider = createUtilProvider();
  });

  describe('JSON Operations', () => {
    test('should stringify simple values', () => {
      expect(provider.json('hello')).toBe('"hello"');
      expect(provider.json(123)).toBe('123');
      expect(provider.json(true)).toBe('true');
      expect(provider.json(null)).toBe('null');
      expect(provider.json(undefined)).toBe('null');
    });

    test('should stringify objects and arrays', () => {
      const obj = { name: 'John', age: 30 };
      const arr = [1, 2, 3];
      
      expect(provider.json(obj)).toBe('{"name":"John","age":30}');
      expect(provider.json(arr)).toBe('[1,2,3]');
    });

    test('should handle circular references gracefully', () => {
      const obj = { name: 'John' };
      obj.self = obj;
      
      expect(provider.json(obj)).toBe('null');
    });

    test('should handle parseJson with valid JSON', () => {
      expect(provider.parseJson('{"name":"John","age":30}')).toEqual({ name: 'John', age: 30 });
      expect(provider.parseJson('[1,2,3]')).toEqual([1, 2, 3]);
      expect(provider.parseJson('"hello"')).toBe('hello');
      expect(provider.parseJson('123')).toBe(123);
      expect(provider.parseJson('true')).toBe(true);
      expect(provider.parseJson('null')).toBe(null);
    });

    test('should return null for invalid JSON', () => {
      expect(provider.parseJson('invalid json')).toBeNull();
      expect(provider.parseJson('{name: "John"}')).toBeNull();
      expect(provider.parseJson('')).toBeNull();
    });

    test('should alias toJson to json', () => {
      const obj = { name: 'John' };
      expect(provider.toJson(obj)).toBe(provider.json(obj));
    });
  });

  describe('Encoding Operations', () => {
    test('should encode and decode base64', () => {
      const text = 'Hello, World!';
      const encoded = provider.base64Encode(text);
      const decoded = provider.base64Decode(encoded);
      
      expect(decoded).toBe(text);
    });

    test('should handle empty strings in base64 operations', () => {
      expect(provider.base64Encode('')).toBe('');
      expect(provider.base64Decode('')).toBe('');
    });

    test('should handle special characters in base64', () => {
      const text = 'Hello, 世界! 🌍';
      const encoded = provider.base64Encode(text);
      const decoded = provider.base64Decode(encoded);
      
      expect(decoded).toBe(text);
    });

    test('should return empty string for invalid base64', () => {
      expect(provider.base64Decode('invalid base64!')).toBe('');
    });

    test('should encode and decode URL components', () => {
      const text = 'Hello, World! & More';
      const encoded = provider.urlEncode(text);
      const decoded = provider.urlDecode(encoded);
      
      expect(decoded).toBe(text);
    });

    test('should handle empty strings in URL operations', () => {
      expect(provider.urlEncode('')).toBe('');
      expect(provider.urlDecode('')).toBe('');
    });

    test('should handle special characters in URL operations', () => {
      const text = 'Hello, 世界! & More';
      const encoded = provider.urlEncode(text);
      const decoded = provider.urlDecode(encoded);
      
      expect(decoded).toBe(text);
    });

    test('should return empty string for invalid URL encoding', () => {
      expect(provider.urlDecode('%invalid')).toBe('');
    });
  });

  describe('JavaScript Escaping', () => {
    test('should escape JavaScript special characters', () => {
      const text = 'Hello "World" and \'Single\' quotes';
      const escaped = provider.escapeJavaScript(text);
      
      expect(escaped).toBe('Hello \\"World\\" and \\\'Single\\\' quotes');
    });

    test('should escape backslashes', () => {
      const text = 'Path: C:\\Users\\John';
      const escaped = provider.escapeJavaScript(text);
      
      expect(escaped).toBe('Path: C:\\\\Users\\\\John');
    });

    test('should escape control characters', () => {
      const text = 'Line1\nLine2\rTab\tForm\fBackspace\bVertical\vNull\0';
      const escaped = provider.escapeJavaScript(text);
      
      expect(escaped).toBe('Line1\\nLine2\\rTab\\tForm\\fBackspace\\bVertical\\vNull\\0');
    });

    test('should handle empty string', () => {
      expect(provider.escapeJavaScript('')).toBe('');
    });

    test('should handle non-string input', () => {
      expect(provider.escapeJavaScript(123)).toBe('');
      expect(provider.escapeJavaScript(null)).toBe('');
      expect(provider.escapeJavaScript(undefined)).toBe('');
      expect(provider.escapeJavaScript({})).toBe('');
    });
  });

  describe('Time Operations', () => {
    test('should return ISO8601 timestamp', () => {
      const timestamp = provider.time.nowISO8601();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should return epoch milliseconds', () => {
      const timestamp = provider.time.epochMilli();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    test('should return epoch seconds', () => {
      const timestamp = provider.time.epochSecond();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBe(Math.floor(provider.time.epochMilli() / 1000));
    });

    test('should format time with template', () => {
      const date = new Date('2023-12-25T12:30:45.123Z');
      const formatted = provider.time.format('yyyy-MM-dd HH:mm:ss', date);
      
      expect(formatted).toBe('2023-12-25 12:30:45');
    });

    test('should format time with milliseconds', () => {
      const date = new Date('2023-12-25T12:30:45.123Z');
      const formatted = provider.time.format('yyyy-MM-dd HH:mm:ss.SSS', date);
      
      expect(formatted).toBe('2023-12-25 12:30:45.123');
    });

    test('should use current time when no date provided', () => {
      const formatted = provider.time.format('yyyy-MM-dd');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should handle various date format patterns', () => {
      const date = new Date('2023-12-25T12:30:45.123Z');
      
      expect(provider.time.format('yyyy', date)).toBe('2023');
      expect(provider.time.format('MM', date)).toBe('12');
      expect(provider.time.format('dd', date)).toBe('25');
      expect(provider.time.format('HH', date)).toBe('12');
      expect(provider.time.format('mm', date)).toBe('30');
      expect(provider.time.format('ss', date)).toBe('45');
      expect(provider.time.format('SSS', date)).toBe('123');
    });
  });

  describe('Utility Functions', () => {
    test('should throw error with message and status code', () => {
      expect(() => {
        provider.error('Test error', 400);
      }).toThrow('VTL Error: Test error (Status: 400)');
    });

    test('should use default status code for error', () => {
      expect(() => {
        provider.error('Test error');
      }).toThrow('VTL Error: Test error (Status: 500)');
    });

    test('should append error message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      provider.appendError('Test error', 400);
      
      expect(consoleSpy).toHaveBeenCalledWith('VTL Error: Test error (Status: 400)');
      
      consoleSpy.mockRestore();
    });

    test('should use default status code for appendError', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      provider.appendError('Test error');
      
      expect(consoleSpy).toHaveBeenCalledWith('VTL Error: Test error (Status: 500)');
      
      consoleSpy.mockRestore();
    });

    test('should abort with message and status code', () => {
      expect(() => {
        provider.abort('Test abort', 400);
      }).toThrow('VTL Abort: Test abort (Status: 400)');
    });

    test('should use default status code for abort', () => {
      expect(() => {
        provider.abort('Test abort');
      }).toThrow('VTL Abort: Test abort (Status: 500)');
    });
  });

  describe('Fixed Time Mode', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = process.env.VELA_FIXED_NOW_ISO8601;
    });

    afterEach(() => {
      process.env.VELA_FIXED_NOW_ISO8601 = originalEnv;
    });

    test('should use fixed time when environment variable is set', () => {
      process.env.VELA_FIXED_NOW_ISO8601 = '2023-12-25T12:00:00.000Z';
      const fixedProvider = createUtilProvider();
      
      expect(fixedProvider.time.nowISO8601()).toBe('2023-12-25T12:00:00.000Z');
      expect(fixedProvider.time.epochMilli()).toBe(1703505600000);
      expect(fixedProvider.time.epochSecond()).toBe(1703505600);
    });

    test('should handle invalid fixed time gracefully', () => {
      process.env.VELA_FIXED_NOW_ISO8601 = 'invalid-date';
      const fixedProvider = createUtilProvider();
      
      // Should fall back to current time
      const timestamp = fixedProvider.time.nowISO8601();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined values in JSON operations', () => {
      expect(provider.json(null)).toBe('null');
      expect(provider.json(undefined)).toBe('null');
      expect(provider.parseJson('null')).toBe(null);
    });

    test('should handle empty strings in encoding operations', () => {
      expect(provider.base64Encode('')).toBe('');
      expect(provider.base64Decode('')).toBe('');
      expect(provider.urlEncode('')).toBe('');
      expect(provider.urlDecode('')).toBe('');
    });

    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const encoded = provider.base64Encode(longString);
      const decoded = provider.base64Decode(encoded);
      
      expect(decoded).toBe(longString);
    });

    test('should handle unicode characters', () => {
      const unicodeString = 'Hello, 世界! 🌍🎉';
      const encoded = provider.base64Encode(unicodeString);
      const decoded = provider.base64Decode(encoded);
      
      expect(decoded).toBe(unicodeString);
    });

    test('should handle complex objects in JSON operations', () => {
      const complexObj = {
        string: 'hello',
        number: 123,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
        date: new Date('2023-12-25T12:00:00Z')
      };
      
      const jsonString = provider.json(complexObj);
      const parsed = provider.parseJson(jsonString);
      
      expect(parsed.string).toBe('hello');
      expect(parsed.number).toBe(123);
      expect(parsed.boolean).toBe(true);
      expect(parsed.null).toBe(null);
      expect(parsed.array).toEqual([1, 2, 3]);
      expect(parsed.object).toEqual({ nested: 'value' });
    });
  });
});

/* Deviation Report: None - $util provider unit tests cover all AWS API Gateway VTL specification fields */
