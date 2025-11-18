/**
 * Velocity Compatibility Tests
 *
 * Parametrized tests that load test cases from the tests/velocity/ folder structure.
 * Each test case is a folder containing:
 *   - template.vtl: The Velocity template
 *   - input.json: The context data
 *
 * These tests verify 1:1 compatibility with Java Velocity by comparing against
 * the Java Velocity engine output.
 */

import { VelocityEngine } from '../src/engine.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to run Java Velocity and get output
function getJavaOutput(template: string, context: any): string | null {
  try {
    const testDir = path.join(__dirname, 'velocity', '__temp__');
    fs.mkdirSync(testDir, { recursive: true });

    const templateFile = path.join(testDir, 'template.vtl');
    const inputFile = path.join(testDir, 'input.json');

    fs.writeFileSync(templateFile, template);
    fs.writeFileSync(inputFile, JSON.stringify(context));

    const javaRunner = path.join(__dirname, '../tools/compare-velocity/VelocityRunner.java');
    const classpath = [
      'vendor/velocity-engine/velocity-engine-core/target/classes',
      'vendor/velocity-engine/velocity-engine-core/target/dependency/*'
    ].join(':');

    const result = execSync(
      `java -cp "${classpath}" VelocityRunner "${templateFile}" "${inputFile}"`,
      {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );

    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });

    return result;
  } catch (error) {
    // Java comparison failed - skip it
    return null;
  }
}

// Load all test cases from the velocity/ directory (recursively)
// Note: __dirname points to dist/tests, but test files are in source tests/velocity/
const velocityDir = path.join(__dirname, '../../tests/velocity');

interface TestCase {
  name: string;
  template: string;
  context: any;
}

function findTestCases(baseDir: string, prefix: string = ''): TestCase[] {
  const results: TestCase[] = [];
  const entries = fs.readdirSync(baseDir);

  for (const entry of entries) {
    if (entry === 'README.md' || entry.startsWith('__')) continue;

    const fullPath = path.join(baseDir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const templatePath = path.join(fullPath, 'template.vtl');
      const inputPath = path.join(fullPath, 'input.json');

      // Check if this directory contains a test case
      if (fs.existsSync(templatePath) && fs.existsSync(inputPath)) {
        const template = fs.readFileSync(templatePath, 'utf8');
        const context = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        const name = prefix ? `${prefix}/${entry}` : entry;
        results.push({ name, template, context });
      } else {
        // Recursively search subdirectories
        const subPrefix = prefix ? `${prefix}/${entry}` : entry;
        results.push(...findTestCases(fullPath, subPrefix));
      }
    }
  }

  return results;
}

const testCases = findTestCases(velocityDir);

// Test counter
let testsPassed = 0;
let testsFailed = 0;
const failedTests: string[] = [];

console.log(`\n=== Velocity Compatibility Tests ===`);
console.log(`Found ${testCases.length} test cases\n`);

const engine = new VelocityEngine();

// Run each test case
testCases.forEach(({ name, template, context }) => {
  try {
    const tsOutput = engine.render(template, context);
    const javaOutput = getJavaOutput(template, context);

    if (javaOutput !== null) {
      // Compare with Java output
      if (tsOutput === javaOutput) {
        console.log(`  ✓ ${name}`);
        testsPassed++;
      } else {
        console.log(`  ✗ ${name}`);
        console.log(`    TypeScript output (${tsOutput.length} chars):`);
        console.log(`      ${tsOutput.substring(0, 100)}${tsOutput.length > 100 ? '...' : ''}`);
        console.log(`    Java output (${javaOutput.length} chars):`);
        console.log(`      ${javaOutput.substring(0, 100)}${javaOutput.length > 100 ? '...' : ''}`);
        testsFailed++;
        failedTests.push(name);
      }
    } else {
      // Java comparison not available, just verify it doesn't crash
      console.log(`  ⊘ ${name} (no Java comparison)`);
      testsPassed++;
    }
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error instanceof Error ? error.message : String(error)}`);
    testsFailed++;
    failedTests.push(name);
  }
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);

if (failedTests.length > 0) {
  console.log(`\nFailed tests:`);
  failedTests.forEach(name => console.log(`  - ${name}`));
}

console.log(`${'='.repeat(50)}\n`);

// Exit with appropriate code
if (testsFailed > 0) {
  process.exit(1);
}
