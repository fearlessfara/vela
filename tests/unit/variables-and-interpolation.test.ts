/**
 * Unit Tests: Variables and Interpolation
 * Tests variable references, interpolation, and quiet references
 */

import { VelocityEngine } from '../../src/engine.js';

let testsPassed = 0;
let testsFailed = 0;

function assertEqual(actual: any, expected: any, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function test(name: string, fn: () => void): void {
  process.stdout.write(`  ${name} ... `);
  try {
    fn();
    console.log('✓');
    testsPassed++;
  } catch (error) {
    console.log('✗');
    console.error(`    ${error instanceof Error ? error.message : String(error)}`);
    testsFailed++;
  }
}

console.log('\n=== Variables and Interpolation Unit Tests ===\n');

// Test Suite 1: Basic Variables
console.log('Basic Variables:');

test('should interpolate simple variable', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Hello, $name!', { name: 'World' });
  assertEqual(result, 'Hello, World!', 'Should interpolate variable');
});

test('should interpolate multiple variables', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$first $last', { first: 'John', last: 'Doe' });
  assertEqual(result, 'John Doe', 'Should interpolate both variables');
});

test('should output literal for undefined variable', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Hello, $name!', {});
  assertEqual(result, 'Hello, $name!', 'Should output literal');
});

test('should interpolate number variable', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Count: $count', { count: 42 });
  assertEqual(result, 'Count: 42', 'Should interpolate number');
});

test('should interpolate boolean variable', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$flag', { flag: true });
  assertEqual(result, 'true', 'Should interpolate boolean');
});

// Test Suite 2: Quiet References
console.log('\nQuiet References:');

test('should suppress undefined quiet reference', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Hello, $!name!', {});
  assertEqual(result, 'Hello, !', 'Should output nothing for quiet ref');
});

test('should interpolate defined quiet reference', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Hello, $!name!', { name: 'World' });
  assertEqual(result, 'Hello, World!', 'Should interpolate quiet ref');
});

test('should suppress quiet null value', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Value: $!value', { value: null });
  assertEqual(result, 'Value: ', 'Should suppress null');
});

// Test Suite 3: Formal References
console.log('\nFormal References:');

test('should interpolate formal reference', () => {
  const engine = new VelocityEngine();
  const result = engine.render('Hello, ${name}!', { name: 'World' });
  assertEqual(result, 'Hello, World!', 'Should interpolate formal ref');
});

test('should handle formal reference next to text', () => {
  const engine = new VelocityEngine();
  const result = engine.render('${name}s are great', { name: 'Apple' });
  assertEqual(result, 'Apples are great', 'Should handle adjacent text');
});

test('should output literal for undefined formal reference', () => {
  const engine = new VelocityEngine();
  const result = engine.render('${missing}', {});
  assertEqual(result, '${missing}', 'Should output literal');
});

test('should distinguish quiet reference syntax', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$!missing', {});
  assertEqual(result, '', 'Should suppress quiet ref');
});

// Test Suite 4: Property Access
console.log('\nProperty Access:');

test('should access object property', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$user.name', { user: { name: 'John' } });
  assertEqual(result, 'John', 'Should access property');
});

test('should access nested properties', () => {
  const engine = new VelocityEngine();
  const context = { user: { address: { city: 'NYC' } } };
  const result = engine.render('$user.address.city', context);
  assertEqual(result, 'NYC', 'Should access nested properties');
});

test('should output literal for missing property', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$user.missing', { user: {} });
  assertEqual(result, '$user.missing', 'Should output literal');
});

test('should suppress missing property with quiet reference', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$!user.missing', { user: {} });
  assertEqual(result, '', 'Should suppress with quiet');
});

// Test Suite 5: String Methods
console.log('\nString Methods:');

test('should call string method', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$name.toUpperCase()', { name: 'hello' });
  assertEqual(result, 'HELLO', 'Should call string method');
});

test('should chain string methods', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$name.toUpperCase().substring(0, 2)', { name: 'hello' });
  assertEqual(result, 'HE', 'Should chain methods');
});

// Test Suite 6: Array Access
console.log('\nArray Access:');

test('should access array element by index', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$items[0]', { items: ['a', 'b', 'c'] });
  assertEqual(result, 'a', 'Should access array element');
});

test('should access array length via size()', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$items.size()', { items: ['a', 'b', 'c'] });
  assertEqual(result, '3', 'Should return array size');
});

test('should call get() on array', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$items.get(1)', { items: ['a', 'b', 'c'] });
  assertEqual(result, 'b', 'Should get array element');
});

test('should check array isEmpty()', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$items.isEmpty()', { items: [] });
  assertEqual(result, 'true', 'Should return true for empty array');
});

// Test Suite 7: Object/Map Methods
console.log('\nObject/Map Methods:');

test('should call keySet() on object', () => {
  const engine = new VelocityEngine();
  const obj = { a: 1, b: 2 };
  const result = engine.render('$obj.keySet().size()', { obj });
  assertEqual(result, '2', 'Should return keys size');
});

test('should call size() on object', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$obj.size()', { obj: { a: 1, b: 2 } });
  assertEqual(result, '2', 'Should return object size');
});

test('should check object isEmpty()', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$obj.isEmpty()', { obj: {} });
  assertEqual(result, 'true', 'Should return true for empty object');
});

// Test Suite 8: String Literals with Interpolation
console.log('\nString Literals with Interpolation:');

test('should interpolate variable in double-quoted string literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = "Hello, $name")$x', { name: 'World' });
  assertEqual(result, 'Hello, World', 'Should interpolate in double quotes');
});

test('should not interpolate in single-quoted string literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render("#set($x = 'Hello, $name')$x", { name: 'World' });
  assertEqual(result, 'Hello, $name', 'Should not interpolate in single quotes');
});

// Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
}, 100);
