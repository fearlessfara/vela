/** AWS-SPEC: Java Comparison Helper | OWNER: vela | STATUS: READY */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

/**
 * Test a template against Java Velocity engine
 * Returns { javaOutput, tsOutput, match, diff }
 */
export async function testAgainstJava(template, context = {}) {
  let javaOutput;
  let javaError = null;
  
  try {
    // Dynamic import to handle path resolution
    // From tests/helpers/java-comparison.js to dist/tools/compare-velocity/java-runner.js
    // Need to go: helpers -> unit -> tests -> root -> dist/tools/compare-velocity
    const javaRunnerPath = new URL('../../dist/tools/compare-velocity/java-runner.js', import.meta.url);
    const { runJavaVelocity } = await import(javaRunnerPath.href);
    javaOutput = await runJavaVelocity({ template, context });
  } catch (error) {
    javaError = error;
    // If Java isn't available, skip the test
    // Log the error for debugging
    if (process.env.DEBUG) {
      console.error('Java runner error:', error);
    }
    return {
      javaOutput: null,
      tsOutput: null,
      match: null,
      diff: null,
      javaError: error.message,
      skipped: true
    };
  }
  
  // Dynamic import for VelocityEngine
  const enginePath = new URL('../../dist/engine.js', import.meta.url);
  const { VelocityEngine } = await import(enginePath.href);
  const engine = new VelocityEngine();
  const tsOutput = engine.render(template, context);
  
  const match = javaOutput === tsOutput;
  const diff = match ? null : generateDiff(javaOutput, tsOutput);
  
  return {
    javaOutput,
    tsOutput,
    match,
    diff,
    javaError: null,
    skipped: false
  };
}

function generateDiff(java, ts) {
  const javaLines = java.split('\n');
  const tsLines = ts.split('\n');
  const maxLines = Math.max(javaLines.length, tsLines.length);
  
  let diff = '';
  for (let i = 0; i < maxLines; i++) {
    const javaLine = javaLines[i] ?? '(missing)';
    const tsLine = tsLines[i] ?? '(missing)';
    
    if (javaLine !== tsLine) {
      diff += `Line ${i + 1}:\n`;
      diff += `  Java: ${JSON.stringify(javaLine)}\n`;
      diff += `  TS:   ${JSON.stringify(tsLine)}\n`;
    }
  }
  
  if (java.length !== ts.length) {
    diff += `\nLength difference: Java=${java.length}, TS=${ts.length}\n`;
  }
  
  return diff;
}

