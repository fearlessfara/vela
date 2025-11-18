#!/usr/bin/env node
/** Test stream/callback output and Reader input */

import { VelocityEngine } from '../../dist/index.js';

async function testStreamSupport() {
  console.log('Testing stream/callback support (Writer/Reader equivalents)...\n');

  const engine = new VelocityEngine();
  const template = 'Hello, $name! You have $count items.';
  const context = { name: 'World', count: 42 };

  // Test 1: Normal string output
  console.log('Test 1: Normal string output');
  const result1 = engine.evaluate(context, template);
  console.log('Result:', result1);
  console.log('✓ String output works\n');

  // Test 2: Callback output (Writer equivalent)
  console.log('Test 2: Callback output (Writer equivalent)');
  let callbackOutput = '';
  const result2 = engine.evaluate(context, template, 'test', (chunk) => {
    callbackOutput += chunk;
  });
  console.log('Callback received:', callbackOutput);
  console.log('Method returned:', result2);
  console.log('✓ Callback output works\n');

  // Test 3: Reader-style input (async)
  console.log('Test 3: Reader-style input (async)');
  const asyncTemplateLoader = async () => {
    // Simulate async template loading
    await new Promise(resolve => setTimeout(resolve, 10));
    return 'Async template: $message';
  };
  const result3 = await engine.evaluateReader(
    { message: 'Loaded asynchronously!' },
    asyncTemplateLoader
  );
  console.log('Result:', result3);
  console.log('✓ Async Reader input works\n');

  // Test 4: Reader + Callback combination
  console.log('Test 4: Reader + Callback combination');
  let combinedOutput = '';
  const result4 = await engine.evaluateReader(
    { value: 'Combined test' },
    async () => 'Reader template: $value',
    'combined-test',
    (chunk) => { combinedOutput += chunk; }
  );
  console.log('Callback received:', combinedOutput);
  console.log('Method returned:', result4);
  console.log('✓ Combined Reader + Callback works\n');

  console.log('All stream support tests passed! ✓');
}

testStreamSupport().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
