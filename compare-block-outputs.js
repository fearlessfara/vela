import { VelocityEngine } from './dist/index.js';
import fs from 'fs';
import { execSync } from 'child_process';

const template = fs.readFileSync('./tests/velocity/block/template.vtl', 'utf-8');
const context = JSON.parse(fs.readFileSync('./tests/velocity/block/input.json', 'utf-8'));

const engine = new VelocityEngine({ spaceGobbling: 'lines' });
const tsOutput = engine.render(template, context);

// Get Java output using the test runner
try {
  const javaOutputFile = '/tmp/java-block-output.txt';
  execSync(`cd tests && node velocityTestRunner.js block > ${javaOutputFile} 2>&1`);

  // Parse the output to get the Java result
  const testOutput = fs.readFileSync(javaOutputFile, 'utf-8');

  // Look for Java output in the test output
  console.log('=== Test Runner Output ===');
  console.log(testOutput.substring(0, 2000));
} catch (e) {
  console.log('Error running Java:', e.message);
}

console.log('\n=== TypeScript Output (first 500 chars) ===');
console.log(JSON.stringify(tsOutput.substring(0, 500)));

console.log('\n=== TypeScript Output Lines 1-15 ===');
const tsLines = tsOutput.split('\n');
for (let i = 0; i < Math.min(15, tsLines.length); i++) {
  console.log(`Line ${i + 1}: ${JSON.stringify(tsLines[i])}`);
}
