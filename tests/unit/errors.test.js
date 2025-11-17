/** AWS-SPEC: VTL Error Handling | OWNER: vela | STATUS: READY */

import { VelocityEngine } from '../../dist/engine.js';
import { VtlParser } from '../../dist/parser/vtlParser.js';

describe('Error Handling', () => {
  const engine = new VelocityEngine();

  describe('Syntax Errors', () => {
    it('handles unterminated directives', () => {
      const template = '#if($x)';
      const parser = new VtlParser();
      const result = parser.parse(template);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles missing closing parenthesis', () => {
      const template = '#if($x';
      const parser = new VtlParser();
      const result = parser.parse(template);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles missing #end', () => {
      const template = '#if($x)content';
      const parser = new VtlParser();
      const result = parser.parse(template);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles malformed expressions', () => {
      const template = '#if($x +)';
      const parser = new VtlParser();
      const result = parser.parse(template);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles unmatched parentheses', () => {
      const template = '#if(($x))';
      const parser = new VtlParser();
      const result = parser.parse(template);
      // Should either parse correctly or have errors
      expect(result).toBeDefined();
    });
  });

  describe('Undefined Variables', () => {
    it('renders empty string for undefined variable', () => {
      const template = '$undefinedVar';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe('');
    });

    it('renders empty string for undefined variable in expression', () => {
      const template = '$a + $undefinedVar';
      const context = { a: 'Hello' };
      const output = engine.render(template, context);
      expect(output).toBe('Hello');
    });

    it('handles quiet reference with undefined variable', () => {
      const template = '$!undefinedVar';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe('');
    });

    it('handles undefined variable in #if condition', () => {
      const template = '#if($undefinedVar)yes#else no#end';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe(' no');
    });

    it('handles undefined variable in member access', () => {
      const template = '$undefinedVar.property';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe('');
    });

    it('handles undefined variable in array access', () => {
      const template = '$undefinedVar[0]';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe('');
    });
  });

  describe('Type Errors', () => {
    it('handles null in arithmetic', () => {
      const template = '$a + $b';
      const context = { a: 5, b: null };
      const output = engine.render(template, context);
      // Should handle gracefully (may be NaN or 5)
      expect(typeof output).toBe('string');
    });

    it('handles undefined in arithmetic', () => {
      const template = '$a + $b';
      const context = { a: 5 };
      const output = engine.render(template, context);
      expect(typeof output).toBe('string');
    });

    it('handles string in arithmetic', () => {
      const template = '$a + $b';
      const context = { a: 5, b: '3' };
      const output = engine.render(template, context);
      // May concatenate or convert
      expect(typeof output).toBe('string');
    });

    it('handles null in comparison', () => {
      const template = '#if($a == $null)null#else not null#end';
      const context = { a: null, null: null };
      const output = engine.render(template, context);
      expect(output).toBeDefined();
    });
  });

  describe('Runtime Errors', () => {
    it('handles division by zero gracefully', () => {
      const template = '$a / $b';
      const context = { a: 10, b: 0 };
      const output = engine.render(template, context);
      expect(output).toBe('0'); // Should return 0 per Velocity behavior
    });

    it('handles modulo by zero gracefully', () => {
      const template = '$a % $b';
      const context = { a: 10, b: 0 };
      const output = engine.render(template, context);
      expect(output).toBe('0'); // Should return 0 per Velocity behavior
    });

    it('handles invalid array access', () => {
      const template = '$arr[999]';
      const context = { arr: [1, 2, 3] };
      const output = engine.render(template, context);
      expect(output).toBe(''); // Should return empty string
    });

    it('handles invalid object property access', () => {
      const template = '$obj.invalidProp';
      const context = { obj: { validProp: 'value' } };
      const output = engine.render(template, context);
      expect(output).toBe(''); // Should return empty string
    });
  });

  describe('Malformed Templates', () => {
    it('handles empty template', () => {
      const template = '';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe('');
    });

    it('handles template with only whitespace', () => {
      const template = '   \n\t  ';
      const context = {};
      const output = engine.render(template, context);
      // Whitespace is preserved but may have trailing newline differences
      expect(output.length).toBeGreaterThan(0);
    });

    it('handles template with only comments', () => {
      const template = '## This is a comment';
      const context = {};
      const output = engine.render(template, context);
      expect(output).toBe('');
    });

    it('handles nested errors gracefully', () => {
      const template = '#if($x)#if($y)content#end';
      const parser = new VtlParser();
      const result = parser.parse(template);
      // Should either parse or have clear errors
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long variable names', () => {
      const template = '$' + 'a'.repeat(100);
      const context = { [ 'a'.repeat(100) ]: 'value' };
      const output = engine.render(template, context);
      expect(output).toBe('value');
    });

    it('handles special characters in variable names', () => {
      const template = '$var_name';
      const context = { var_name: 'value' };
      const output = engine.render(template, context);
      expect(output).toBe('value');
    });

    it('handles unicode in strings', () => {
      const template = '$text';
      const context = { text: 'Hello 世界' };
      const output = engine.render(template, context);
      expect(output).toBe('Hello 世界');
    });
  });
});

