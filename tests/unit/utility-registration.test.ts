/**
 * Unit Tests: Utility Registration
 *
 * These tests validate the ability to register utility classes, objects,
 * and methods in the VTL context (similar to Java's context.put()).
 *
 * These tests DO NOT rely on Java Velocity - they are standalone unit tests.
 */

import { VelocityEngine } from '../../src/engine.js';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function test(name: string, fn: () => void | Promise<void>): void {
  process.stdout.write(`  ${name} ... `);
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log('✓');
        testsPassed++;
      }).catch((error) => {
        console.log('✗');
        console.error(`    ${error.message}`);
        testsFailed++;
      });
    } else {
      console.log('✓');
      testsPassed++;
    }
  } catch (error) {
    console.log('✗');
    console.error(`    ${error instanceof Error ? error.message : String(error)}`);
    testsFailed++;
  }
}

// Utility classes for testing
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
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  truncate(str: string, maxLen: number): string {
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  }
}

console.log('\n=== Utility Registration Unit Tests ===\n');

// Test Suite 1: Static Utility Classes
console.log('Static Utility Classes:');

test('should call static method on registered class', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    MathUtil: MathUtil,
    x: 5,
    y: 10
  };

  const result = engine.render('$MathUtil.add($x, $y)', context);
  assertEqual(result, '15', 'Should add 5 + 10');
});

test('should call static method with literal arguments', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = { MathUtil: MathUtil };
  const result = engine.render('$MathUtil.multiply(3, 4)', context);
  assertEqual(result, '12', 'Should multiply 3 * 4');
});

test('should call static method with variadic arguments', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = { MathUtil: MathUtil };
  const result = engine.render('$MathUtil.max(1, 5, 3, 2)', context);
  assertEqual(result, '5', 'Should return max value');
});

test('should call multiple static methods in template', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = { MathUtil: MathUtil };
  const template = '$MathUtil.add(5, 10) - $MathUtil.ceil(2.3)';
  const result = engine.render(template, context);
  assertEqual(result, '15 - 3', 'Should evaluate both methods');
});

// Test Suite 2: Instance-Based Utility Objects
console.log('\nInstance-Based Utility Objects:');

test('should call instance method on registered object', () => {
  const engine = new VelocityEngine();
  engine.init();

  const util = new StringUtil();
  const context = { util: util, name: 'hello' };

  const result = engine.render('$util.capitalize($name)', context);
  assertEqual(result, 'Hello', 'Should capitalize string');
});

test('should call multiple instance methods', () => {
  const engine = new VelocityEngine();
  engine.init();

  const util = new StringUtil();
  const context = { util: util };

  const template = '$util.reverse("abc") - $util.capitalize("test")';
  const result = engine.render(template, context);
  assertEqual(result, 'cba - Test', 'Should execute both methods');
});

test('should call instance method with multiple arguments', () => {
  const engine = new VelocityEngine();
  engine.init();

  const util = new StringUtil();
  const context = { util: util, text: 'This is a long text' };

  const result = engine.render('$util.truncate($text, 10)', context);
  assertEqual(result, 'This is a ...', 'Should truncate text');
});

// Test Suite 3: Inline Function Objects
console.log('\nInline Function Objects:');

test('should call inline arrow function', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: {
      double: (n: number) => n * 2
    },
    value: 7
  };

  const result = engine.render('$util.double($value)', context);
  assertEqual(result, '14', 'Should double the value');
});

test('should call multiple inline functions', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: {
      add: (a: number, b: number) => a + b,
      multiply: (a: number, b: number) => a * b
    }
  };

  const template = '$util.add(3, 4) - $util.multiply(2, 5)';
  const result = engine.render(template, context);
  assertEqual(result, '7 - 10', 'Should execute both functions');
});

test('should call function that returns string', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: {
      formatCurrency: (amount: number) => '$' + amount.toFixed(2)
    },
    price: 42.5
  };

  const result = engine.render('$util.formatCurrency($price)', context);
  assertEqual(result, '$42.50', 'Should format currency');
});

test('should call function that returns array result', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: {
      join: (arr: any[], sep: string) => arr.join(sep)
    },
    items: ['a', 'b', 'c']
  };

  const result = engine.render('$util.join($items, ", ")', context);
  assertEqual(result, 'a, b, c', 'Should join array');
});

// Test Suite 4: Built-in JavaScript Objects
console.log('\nBuilt-in JavaScript Objects:');

test('should use JavaScript Math object', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = { Math: Math };
  const result = engine.render('$Math.ceil(2.3)', context);
  assertEqual(result, '3', 'Should use Math.ceil');
});

test('should call multiple Math methods', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = { Math: Math };
  const template = '$Math.floor(2.7) - $Math.round(2.5) - $Math.sqrt(16)';
  const result = engine.render(template, context);
  assertEqual(result, '2 - 3 - 4', 'Should execute all Math methods');
});

test('should access Math constants', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = { Math: Math };
  const result = engine.render('$Math.PI', context);
  assert(result === String(Math.PI), 'Should access Math.PI constant');
});

// Test Suite 5: Utilities in Control Structures
console.log('\nUtilities in Control Structures:');

test('should use utility in #if condition', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { isEven: (n: number) => n % 2 === 0 },
    number: 4
  };

  const template = '#if($util.isEven($number))even#else odd#end';
  const result = engine.render(template, context);
  assertEqual(result, 'even', 'Should detect even number');
});

test('should use utility in #foreach loop', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { square: (n: number) => n * n },
    numbers: [2, 3, 4]
  };

  const template = '#foreach($n in $numbers)$util.square($n)#if($foreach.hasNext), #end#end';
  const result = engine.render(template, context);
  assertEqual(result, '4, 9, 16', 'Should square all numbers');
});

test('should use utility in nested conditions', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: {
      isEven: (n: number) => n % 2 === 0,
      isPositive: (n: number) => n > 0
    },
    value: 4
  };

  const template = '#if($util.isEven($value))#if($util.isPositive($value))even-positive#end#end';
  const result = engine.render(template, context);
  assertEqual(result, 'even-positive', 'Should handle nested conditions');
});

test('should combine utilities with VTL operations', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { double: (n: number) => n * 2 },
    x: 5
  };

  const template = '#set($y = $util.double($x))Result: $y';
  const result = engine.render(template, context);
  assertEqual(result, 'Result: 10', 'Should use utility in #set');
});

// Test Suite 6: Edge Cases
console.log('\nEdge Cases:');

test('should handle utility returning null', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { returnNull: () => null }
  };

  const result = engine.render('$util.returnNull()', context);
  assertEqual(result, '$util.returnNull()', 'Should output literal for null result');
});

test('should handle utility returning undefined', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { returnUndefined: () => undefined }
  };

  const result = engine.render('$util.returnUndefined()', context);
  assertEqual(result, '$util.returnUndefined()', 'Should output literal for undefined result');
});

test('should handle utility returning boolean', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { isTrue: () => true, isFalse: () => false }
  };

  const template = '$util.isTrue() - $util.isFalse()';
  const result = engine.render(template, context);
  assertEqual(result, 'true - false', 'Should output boolean values');
});

test('should handle utility returning object', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { getObject: () => ({ name: 'test', value: 42 }) }
  };

  const result = engine.render('$util.getObject().name', context);
  assertEqual(result, 'test', 'Should access object properties');
});

test('should chain utility calls', () => {
  const engine = new VelocityEngine();
  engine.init();

  const util = new StringUtil();
  const context = { util: util };

  const result = engine.render('$util.reverse($util.capitalize("hello"))', context);
  assertEqual(result, 'olleH', 'Should chain utility calls');
});

// Test Suite 7: Multiple Utilities
console.log('\nMultiple Utilities:');

test('should use multiple utility objects in same template', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    MathUtil: MathUtil,
    StringUtil: new StringUtil(),
    x: 5,
    y: 10,
    name: 'test'
  };

  const template = '$MathUtil.add($x, $y) - $StringUtil.capitalize($name)';
  const result = engine.render(template, context);
  assertEqual(result, '15 - Test', 'Should use multiple utilities');
});

test('should handle utility name conflicts gracefully', () => {
  const engine = new VelocityEngine();
  engine.init();

  const context = {
    util: { getValue: () => 'util1' },
    util2: { getValue: () => 'util2' }
  };

  const template = '$util.getValue() - $util2.getValue()';
  const result = engine.render(template, context);
  assertEqual(result, 'util1 - util2', 'Should distinguish between utilities');
});

// Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
}, 100);
