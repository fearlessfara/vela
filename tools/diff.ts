#!/usr/bin/env node

/** AWS-SPEC: Golden Diff Tool | OWNER: vela | STATUS: READY */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// APIGW:Golden Diff Tool

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DiffResult {
  testName: string;
  passed: boolean;
  output: string;
  expected: string;
  diff?: string;
}

function findTestCases(baseDir: string): string[] {
  const testDirs: string[] = [];
  
  function scanDir(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        const templatePath = join(fullPath, 'template.vtl');
        const requestPath = join(fullPath, 'request.json');
        
        if (existsSync(templatePath) && existsSync(requestPath)) {
          testDirs.push(fullPath);
        } else {
          scanDir(fullPath);
        }
      }
    }
  }
  
  scanDir(baseDir);
  return testDirs;
}

function runTestCase(testDir: string): DiffResult {
  const testName = testDir.split('/').pop() || 'unknown';
  
  try {
    // Run the test using the run-apigw tool
    const output = execSync(`node ${join(__dirname, 'run-apigw.ts')} "${testDir}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    const expectedPath = join(testDir, 'expected.apigw.txt');
    const expected = existsSync(expectedPath) ? readFileSync(expectedPath, 'utf8') : '';
    
    // Extract the actual output from the run-apigw output
    const lines = output.split('\n');
    const outputStart = lines.findIndex(line => line === 'Output:');
    const expectedStart = lines.findIndex(line => line === 'Expected:');
    
    let actualOutput = '';
    if (outputStart !== -1) {
      const outputLines = lines.slice(outputStart + 1);
      if (expectedStart !== -1) {
        actualOutput = outputLines.slice(0, expectedStart - outputStart - 1).join('\n');
      } else {
        actualOutput = outputLines.join('\n');
      }
    }
    
    const passed = actualOutput.trim() === expected.trim();
    
    let diff = '';
    if (!passed && expected) {
      try {
        // Use system diff if available
        const tempFile = '/tmp/vela-actual.txt';
        require('fs').writeFileSync(tempFile, actualOutput);
        diff = execSync(`diff -u "${expectedPath}" "${tempFile}"`, { encoding: 'utf8' });
      } catch {
        // Fallback to simple comparison
        diff = `Expected:\n${expected}\n\nActual:\n${actualOutput}`;
      }
    }
    
    return {
      testName,
      passed,
      output: actualOutput,
      expected,
      diff: diff || '',
    };
  } catch (error) {
    return {
      testName,
      passed: false,
      output: '',
      expected: '',
      diff: error instanceof Error ? error.message : String(error),
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const baseDir = args[0] || join(__dirname, '..', 'tests', 'conformance');
  
  console.log(`Running conformance tests in: ${baseDir}`);
  console.log('=' .repeat(50));
  
  const testDirs = findTestCases(baseDir);
  
  if (testDirs.length === 0) {
    console.log('No test cases found');
    process.exit(1);
  }
  
  const results: DiffResult[] = [];
  let passedCount = 0;
  
  for (const testDir of testDirs) {
    console.log(`\nRunning test: ${testDir}`);
    const result = runTestCase(testDir);
    results.push(result);
    
    if (result.passed) {
      console.log('✅ PASSED');
      passedCount++;
    } else {
      console.log('❌ FAILED');
      if (result.diff) {
        console.log('\nDiff:');
        console.log(result.diff);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passedCount}/${results.length} tests passed`);
  
  if (passedCount < results.length) {
    console.log('\nFailed tests:');
    for (const result of results) {
      if (!result.passed) {
        console.log(`  - ${result.testName}`);
      }
    }
    process.exit(1);
  } else {
    console.log('All tests passed! 🎉');
    process.exit(0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

/* Deviation Report: None - Diff tool matches AWS API Gateway VTL specification */
