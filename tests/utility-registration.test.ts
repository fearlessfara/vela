/** Test: Utility Registration in VTL Context
 *
 * This test demonstrates how to register utility objects and methods
 * in the Velocity context, similar to Java Velocity's context.put() functionality.
 */

import { VelocityEngine } from '../src/engine.js';
import { strict as assert } from 'assert';

// Define utility classes similar to Java
class MathUtil {
  static add(a: number, b: number): number {
    return a + b;
  }

  static multiply(a: number, b: number): number {
    return a * b;
  }

  static max(...numbers: number[]): number {
    return Math.max(...numbers);
  }

  static ceil(n: number): number {
    return Math.ceil(n);
  }
}

class StringUtil {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  static repeat(str: string, times: number): string {
    return str.repeat(times);
  }
}

// Instance-based utility class
class DateUtil {
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  format(date: Date, format: string): string {
    // Simple date formatting
    if (format === 'YYYY-MM-DD') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date.toISOString();
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

describe('Utility Registration', () => {
  let engine: VelocityEngine;

  beforeEach(() => {
    engine = new VelocityEngine();
    engine.init();
  });

  it('should allow registering static utility classes', () => {
    // Register MathUtil class (similar to Java's context.put("Math", Math.class))
    const context = {
      MathUtil: MathUtil,
      x: 5,
      y: 10
    };

    const template = '$MathUtil.add($x, $y)';
    const result = engine.render(template, context);
    assert.equal(result, '15');
  });

  it('should support multiple static utility methods', () => {
    const context = {
      Math: MathUtil,
      StringUtil: StringUtil
    };

    const template = `
Math operations:
- 5 + 10 = $Math.add(5, 10)
- 3 * 4 = $Math.multiply(3, 4)
- max(1,5,3) = $Math.max(1, 5, 3)
- ceil(2.3) = $Math.ceil(2.3)

String operations:
- capitalize("hello") = $StringUtil.capitalize("hello")
- reverse("hello") = $StringUtil.reverse("hello")
- repeat("x", 3) = $StringUtil.repeat("x", 3)
`.trim();

    const result = engine.render(template, context);

    const expected = `
Math operations:
- 5 + 10 = 15
- 3 * 4 = 12
- max(1,5,3) = 5
- ceil(2.3) = 3

String operations:
- capitalize("hello") = Hello
- reverse("hello") = olleh
- repeat("x", 3) = xxx
`.trim();

    assert.equal(result, expected);
  });

  it('should allow registering instance-based utility objects', () => {
    // Create an instance of the utility class
    const dateUtil = new DateUtil();
    const testDate = new Date('2024-01-15');

    const context = {
      util: dateUtil,
      date: testDate
    };

    const template = '$util.format($date, "YYYY-MM-DD")';
    const result = engine.render(template, context);
    assert.equal(result, '2024-01-15');
  });

  it('should support custom utility objects with complex methods', () => {
    // Custom utility object with various helper methods
    const util = {
      // String helpers
      truncate: (str: string, maxLen: number) => {
        return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
      },

      // Number helpers
      formatCurrency: (amount: number) => {
        return '$' + amount.toFixed(2);
      },

      // Array helpers
      join: (arr: any[], separator: string) => {
        return arr.join(separator);
      },

      // Conditional helpers
      ifNull: (value: any, defaultValue: any) => {
        return value !== null && value !== undefined ? value : defaultValue;
      }
    };

    const context = {
      util: util,
      longText: 'This is a very long text that needs to be truncated',
      price: 42.5,
      items: ['apple', 'banana', 'cherry'],
      nullValue: null
    };

    const template = `
- Truncated: $util.truncate($longText, 20)
- Price: $util.formatCurrency($price)
- Items: $util.join($items, ", ")
- Default: $util.ifNull($nullValue, "N/A")
`.trim();

    const result = engine.render(template, context);

    const expected = `
- Truncated: This is a very long ...
- Price: $42.50
- Items: apple, banana, cherry
- Default: N/A
`.trim();

    assert.equal(result, expected);
  });

  it('should support built-in JavaScript Math class', () => {
    const context = {
      Math: Math,
      pi: Math.PI
    };

    const template = `
- ceil(2.3) = $Math.ceil(2.3)
- floor(2.7) = $Math.floor(2.7)
- round(2.5) = $Math.round(2.5)
- sqrt(16) = $Math.sqrt(16)
- PI = $pi
`.trim();

    const result = engine.render(template, context);

    const expected = `
- ceil(2.3) = 3
- floor(2.7) = 2
- round(2.5) = 3
- sqrt(16) = 4
- PI = ${Math.PI}
`.trim();

    assert.equal(result, expected);
  });

  it('should work with utility methods in conditionals and loops', () => {
    const util = {
      isEven: (n: number) => n % 2 === 0,
      double: (n: number) => n * 2
    };

    const context = {
      util: util,
      numbers: [1, 2, 3, 4, 5]
    };

    const template = `
#foreach($n in $numbers)
#if($util.isEven($n))
$n is even, doubled = $util.double($n)
#else
$n is odd
#end
#end
`.trim();

    const result = engine.render(template, context);

    const expected = `
1 is odd
2 is even, doubled = 4
3 is odd
4 is even, doubled = 8
5 is odd
`.trim();

    assert.equal(result, expected);
  });
});

// Run the tests
console.log('Running Utility Registration Tests...\n');

const tests = [
  {
    name: 'Static utility classes',
    fn: () => {
      const engine = new VelocityEngine();
      engine.init();

      const context = {
        MathUtil: MathUtil,
        x: 5,
        y: 10
      };

      const template = '$MathUtil.add($x, $y)';
      const result = engine.render(template, context);
      assert.equal(result, '15');
      console.log('✓ Static utility classes test passed');
    }
  },
  {
    name: 'Multiple static utility methods',
    fn: () => {
      const engine = new VelocityEngine();
      engine.init();

      const context = {
        Math: MathUtil,
        StringUtil: StringUtil
      };

      const template = `$Math.add(5, 10) - $StringUtil.capitalize("hello")`;
      const result = engine.render(template, context);
      assert.equal(result, '15 - Hello');
      console.log('✓ Multiple static utility methods test passed');
    }
  },
  {
    name: 'Instance-based utility objects',
    fn: () => {
      const engine = new VelocityEngine();
      engine.init();

      const dateUtil = new DateUtil();
      const testDate = new Date('2024-01-15');

      const context = {
        util: dateUtil,
        date: testDate
      };

      const template = '$util.format($date, "YYYY-MM-DD")';
      const result = engine.render(template, context);
      assert.equal(result, '2024-01-15');
      console.log('✓ Instance-based utility objects test passed');
    }
  },
  {
    name: 'Custom utility objects',
    fn: () => {
      const engine = new VelocityEngine();
      engine.init();

      const util = {
        truncate: (str: string, maxLen: number) => {
          return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
        }
      };

      const context = {
        util: util,
        text: 'This is a long text'
      };

      const template = '$util.truncate($text, 10)';
      const result = engine.render(template, context);
      assert.equal(result, 'This is a ...');
      console.log('✓ Custom utility objects test passed');
    }
  },
  {
    name: 'Built-in JavaScript Math',
    fn: () => {
      const engine = new VelocityEngine();
      engine.init();

      const context = {
        Math: Math
      };

      const template = '$Math.ceil(2.3) - $Math.floor(2.7)';
      const result = engine.render(template, context);
      assert.equal(result, '3 - 2');
      console.log('✓ Built-in JavaScript Math test passed');
    }
  }
];

// Run all tests
let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    test.fn();
    passed++;
  } catch (error) {
    console.error(`✗ ${test.name} failed:`, error);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
