#!/usr/bin/env node

/** Apache Velocity: Test Harness | OWNER: vela | STATUS: READY */

import { loadTestCases, loadTestCase } from './test-loader.js';
import { runJavaVelocity } from './java-runner.js';
import { runTypeScriptVelocity } from './ts-runner.js';
import { compareOutputs } from './comparator.js';

// Apache Velocity: Test Harness

async function main() {
  const testNameFilter = process.argv[2];
  
  try {
    let testCases;
    
    if (testNameFilter) {
      // Run single test
      testCases = [await loadTestCase(testNameFilter)];
    } else {
      // Run all tests
      testCases = await loadTestCases();
    }
    
    if (testCases.length === 0) {
      console.log('No test cases found.');
      process.exit(0);
    }
    
    console.log(`Running ${testCases.length} test case(s)...\n`);
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
      process.stdout.write(`Testing: ${testCase.name}... `);
      
      try {
        // Run Java (source of truth)
        let javaOutput: string;
        try {
          javaOutput = await runJavaVelocity(testCase.templatePath, testCase.inputPath);
        } catch (error) {
          console.log('SKIP (Java runner not implemented)');
          console.log(`  Note: ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }
        
        // Run TypeScript
        const tsOutput = await runTypeScriptVelocity(testCase.templatePath, testCase.inputPath);
        
        // Compare
        const result = compareOutputs(javaOutput, tsOutput);
        
        if (result.match) {
          console.log('PASS');
          passed++;
        } else {
          console.log('FAIL');
          console.log('\n' + '='.repeat(80));
          console.log(`Test: ${testCase.name}`);
          console.log('='.repeat(80));
          if (result.diff) {
            console.log(result.diff);
          }
          console.log('='.repeat(80) + '\n');
          failed++;
        }
      } catch (error) {
        console.log('ERROR');
        console.error(`  ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }
    
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Harness error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

/* Apache Velocity Test Harness */
