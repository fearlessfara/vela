#!/usr/bin/env node
/** Test a single test case */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { runJavaVelocity } from './java-runner.js';
import { runTSVelocity } from './ts-runner.js';
import { compareOutputs } from './comparator.js';

async function main() {
  const testName = process.argv[2] || 'basic-interpolation';
  const testDir = join(process.cwd(), 'tests/velocity', testName);
  
  console.log(`Testing: ${testName}\n`);
  
  try {
    const template = await readFile(join(testDir, 'template.vtl'), 'utf-8');
    const context = JSON.parse(await readFile(join(testDir, 'input.json'), 'utf-8'));
    
    console.log('Running Java...');
    const javaOutput = await runJavaVelocity({ template, context });
    console.log('Java output length:', javaOutput.length);
    
    console.log('\nRunning TypeScript...');
    const tsOutput = await runTSVelocity({
      templatePath: join(testDir, 'template.vtl'),
      inputPath: join(testDir, 'input.json'),
    });
    console.log('TS output length:', tsOutput.length);
    
    console.log('\nComparing...');
    const result = compareOutputs(javaOutput, tsOutput);
    
    if (result.match) {
      console.log('✅ MATCH!');
    } else {
      console.log('❌ MISMATCH');
      console.log('\n' + result.diff);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
