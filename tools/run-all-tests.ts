#!/usr/bin/env node

/** AWS-SPEC: APIGW Test Runner | OWNER: vela | STATUS: READY */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
// Dynamic import to avoid TypeScript compilation issues
const { renderTemplate, DEFAULT_FLAGS } = await import('../index.js' as any);

// APIGW:APIGW Test Runner

interface TestCase {
  name: string;
  template: string;
  request: any;
  expected: string;
}

function loadTestCase(testDir: string): TestCase {
  const templatePath = join(testDir, 'template.vtl');
  const requestPath = join(testDir, 'request.json');
  const expectedPath = join(testDir, 'expected.apigw.txt');

  if (!existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  if (!existsSync(requestPath)) {
    throw new Error(`Request file not found: ${requestPath}`);
  }

  const template = readFileSync(templatePath, 'utf8');
  const request = JSON.parse(readFileSync(requestPath, 'utf8'));
  const expected = existsSync(expectedPath) ? readFileSync(expectedPath, 'utf8') : '';

  return {
    name: testDir.split('/').pop() || 'unknown',
    template,
    request,
    expected,
  };
}

function runTestCase(testCase: TestCase): { output: string; passed: boolean; error?: string } {
  try {
    const result = renderTemplate({
      template: testCase.template,
      event: testCase.request,
      flags: {
        ...DEFAULT_FLAGS,
        APIGW_UTILS: 'ON',
        APIGW_INPUT: 'ON',
        APIGW_CONTEXT: 'ON',
      },
    });

    if (result.errors.length > 0) {
      return {
        output: result.output,
        passed: false,
        error: result.errors.join('; '),
      };
    }

    return {
      output: result.output,
      passed: true,
    };
  } catch (error) {
    return {
      output: '',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const conformanceDir = 'tests/conformance';
  
  if (!existsSync(conformanceDir)) {
    console.error(`Conformance directory not found: ${conformanceDir}`);
    process.exit(1);
  }

  const testDirs = readdirSync(conformanceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => join(conformanceDir, dirent.name));

  if (testDirs.length === 0) {
    console.log('No test directories found in conformance folder');
    process.exit(0);
  }

  console.log(`Running ${testDirs.length} conformance tests...\n`);

  let passed = 0;
  let failed = 0;

  for (const testDir of testDirs) {
    try {
      const testCase = loadTestCase(testDir);
      const result = runTestCase(testCase);
      
      console.log(`Test: ${testCase.name}`);
      console.log(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
      
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
      
      console.log('Output:');
      console.log(result.output);
      
      console.log('\nExpected:');
      console.log(testCase.expected);
      
      if (result.output.trim() !== testCase.expected.trim()) {
        console.log('\n❌ Output does not match expected result');
        failed++;
      } else {
        console.log('\n✅ Output matches expected result');
        passed++;
      }
      
      console.log('\n' + '='.repeat(80) + '\n');
      
    } catch (error) {
      console.error(`Error running test ${testDir}:`, error instanceof Error ? error.message : String(error));
      failed++;
      console.log('\n' + '='.repeat(80) + '\n');
    }
  }

  console.log(`\nTest Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

/* Deviation Report: None - Test runner matches AWS API Gateway VTL specification */
