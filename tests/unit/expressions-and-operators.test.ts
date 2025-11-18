/**
 * Unit Tests: Expressions and Operators
 * Tests arithmetic, comparison, logical operators, and literals
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

console.log('\n=== Expressions and Operators Unit Tests ===\n');

// Test Suite 1: Arithmetic Operators
console.log('Arithmetic Operators:');

test('should add numbers', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 5 + 3)$x', {});
  assertEqual(result, '8', 'Should add numbers');
});

test('should subtract numbers', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 10 - 3)$x', {});
  assertEqual(result, '7', 'Should subtract numbers');
});

test('should multiply numbers', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 4 * 5)$x', {});
  assertEqual(result, '20', 'Should multiply numbers');
});

test('should divide numbers', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 15 / 3)$x', {});
  assertEqual(result, '5', 'Should divide numbers');
});

test('should calculate modulo', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 10 % 3)$x', {});
  assertEqual(result, '1', 'Should calculate modulo');
});

test('should handle operator precedence', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 2 + 3 * 4)$x', {});
  assertEqual(result, '14', 'Should follow precedence');
});

test('should handle parentheses', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = (2 + 3) * 4)$x', {});
  assertEqual(result, '20', 'Should respect parentheses');
});

test('should concatenate with + operator', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = "Hello" + " " + "World")$x', {});
  assertEqual(result, 'Hello World', 'Should concatenate strings');
});

// Test Suite 2: Comparison Operators
console.log('\nComparison Operators:');

test('should compare with ==', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(5 == 5)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare equal');
});

test('should compare with !=', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(5 != 3)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare not equal');
});

test('should compare with <', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(3 < 5)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare less than');
});

test('should compare with <=', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(5 <= 5)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare less than or equal');
});

test('should compare with >', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(10 > 5)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare greater than');
});

test('should compare with >=', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(5 >= 5)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare greater than or equal');
});

test('should compare strings', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if("abc" == "abc")yes#else no#end', {});
  assertEqual(result, 'yes', 'Should compare strings');
});

// Test Suite 3: Logical Operators
console.log('\nLogical Operators:');

test('should evaluate AND (&&) operator', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(true && true)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should evaluate AND');
});

test('should short-circuit AND', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(false && true)yes#else no#end', {});
  assertEqual(result, ' no', 'Should short-circuit AND');
});

test('should evaluate OR (||) operator', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(false || true)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should evaluate OR');
});

test('should short-circuit OR', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(true || false)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should short-circuit OR');
});

test('should evaluate NOT (!) operator', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(!false)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should evaluate NOT');
});

test('should combine logical operators', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(true && (false || true))yes#else no#end', {});
  assertEqual(result, 'yes', 'Should combine operators');
});

// Test Suite 4: Unary Operators
console.log('\nUnary Operators:');

test('should negate number with -', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = -5)$x', {});
  assertEqual(result, '-5', 'Should negate number');
});

test('should apply unary + to number', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = +5)$x', {});
  assertEqual(result, '5', 'Should apply unary +');
});

test('should negate boolean with !', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(!true)yes#else no#end', {});
  assertEqual(result, ' no', 'Should negate boolean');
});

// Test Suite 5: Ternary Operator
console.log('\nTernary Operator:');

test('should evaluate ternary operator (true case)', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = true ? "yes" : "no")$x', {});
  assertEqual(result, 'yes', 'Should return true case');
});

test('should evaluate ternary operator (false case)', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = false ? "yes" : "no")$x', {});
  assertEqual(result, 'no', 'Should return false case');
});

test('should evaluate ternary with expressions', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = (5 > 3) ? "big" : "small")$x', {});
  assertEqual(result, 'big', 'Should evaluate expression');
});

test('should nest ternary operators', () => {
  const engine = new VelocityEngine();
  const template = '#set($x = true ? (false ? "a" : "b") : "c")$x';
  const result = engine.render(template, {});
  assertEqual(result, 'b', 'Should nest ternary');
});

// Test Suite 6: Literals
console.log('\nLiterals:');

test('should handle integer literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 42)$x', {});
  assertEqual(result, '42', 'Should handle integer');
});

test('should handle float literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = 3.14)$x', {});
  assertEqual(result, '3.14', 'Should handle float');
});

test('should handle string literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = "Hello")$x', {});
  assertEqual(result, 'Hello', 'Should handle string');
});

test('should handle boolean true literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = true)$x', {});
  assertEqual(result, 'true', 'Should handle true');
});

test('should handle boolean false literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = false)$x', {});
  assertEqual(result, 'false', 'Should handle false');
});

test('should handle array literal', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = [1, 2, 3])$x.size()', {});
  assertEqual(result, '3', 'Should handle array literal');
});

test('should handle object via set and access', () => {
  const engine = new VelocityEngine();
  const result = engine.render('$obj.name', { obj: { name: 'John', age: 30 } });
  assertEqual(result, 'John', 'Should access object property');
});

test('should handle range literal', () => {
  const engine = new VelocityEngine();
  const template = '#foreach($i in [1..3])$i#if($foreach.hasNext), #end#end';
  const result = engine.render(template, {});
  assertEqual(result, '1, 2, 3', 'Should handle range literal');
});

// Test Suite 7: Complex Expressions
console.log('\nComplex Expressions:');

test('should evaluate complex arithmetic', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#set($x = (10 + 5) * 2 - 8 / 4)$x', {});
  assertEqual(result, '28', 'Should evaluate complex expression');
});

test('should evaluate complex comparison', () => {
  const engine = new VelocityEngine();
  const template = '#if((5 + 3) > (2 * 3))yes#else no#end';
  const result = engine.render(template, {});
  assertEqual(result, 'yes', 'Should evaluate complex comparison');
});

test('should combine arithmetic and logical', () => {
  const engine = new VelocityEngine();
  const template = '#if((5 > 3) && (10 < 20))yes#else no#end';
  const result = engine.render(template, {});
  assertEqual(result, 'yes', 'Should combine operators');
});

test('should evaluate expressions with variables', () => {
  const engine = new VelocityEngine();
  const template = '#set($result = $a + $b * $c)$result';
  const result = engine.render(template, { a: 2, b: 3, c: 4 });
  assertEqual(result, '14', 'Should use variables in expression');
});

// Test Suite 8: Truthiness
console.log('\nTruthiness:');

test('should treat 0 as falsy', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(0)yes#else no#end', {});
  assertEqual(result, ' no', 'Should treat 0 as falsy');
});

test('should treat non-zero as truthy', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if(1)yes#else no#end', {});
  assertEqual(result, 'yes', 'Should treat non-zero as truthy');
});

test('should treat empty string as falsy', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if("")yes#else no#end', {});
  assertEqual(result, ' no', 'Should treat empty string as falsy');
});

test('should treat non-empty string as truthy', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if("text")yes#else no#end', {});
  assertEqual(result, 'yes', 'Should treat non-empty string as truthy');
});

test('should treat empty array as falsy', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if([])yes#else no#end', {});
  assertEqual(result, ' no', 'Should treat empty array as falsy');
});

test('should treat non-empty array as truthy', () => {
  const engine = new VelocityEngine();
  const result = engine.render('#if([1])yes#else no#end', {});
  assertEqual(result, 'yes', 'Should treat non-empty array as truthy');
});

// Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
}, 100);
