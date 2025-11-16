/** Apache Velocity: Output Comparator | OWNER: vela | STATUS: READY */

export interface ComparisonResult {
  match: boolean;
  diff?: string;
  javaOutput?: string;
  tsOutput?: string;
}

export function compareOutputs(javaOutput: string, tsOutput: string): ComparisonResult {
  if (javaOutput === tsOutput) {
    return {
      match: true,
    };
  }

  // Generate a simple diff
  const diff = generateDiff(javaOutput, tsOutput);
  
  return {
    match: false,
    diff,
    javaOutput,
    tsOutput,
  };
}

function generateDiff(javaOutput: string, tsOutput: string): string {
  const javaLines = javaOutput.split('\n');
  const tsLines = tsOutput.split('\n');
  const maxLines = Math.max(javaLines.length, tsLines.length);
  
  const diffLines: string[] = [];
  diffLines.push('Output mismatch detected:');
  diffLines.push('');
  
  for (let i = 0; i < maxLines; i++) {
    const javaLine = javaLines[i] ?? '';
    const tsLine = tsLines[i] ?? '';
    
    if (javaLine !== tsLine) {
      diffLines.push(`Line ${i + 1}:`);
      diffLines.push(`  Java: ${javaLine}`);
      diffLines.push(`  TS:   ${tsLine}`);
      diffLines.push('');
    }
  }
  
  // Also show byte-level differences if they're different lengths
  if (javaOutput.length !== tsOutput.length) {
    diffLines.push(`Length difference: Java=${javaOutput.length}, TS=${tsOutput.length}`);
    diffLines.push('');
  }
  
  // Show first 200 chars of each if very different
  if (javaOutput !== tsOutput) {
    diffLines.push('First 200 chars:');
    diffLines.push(`  Java: ${javaOutput.substring(0, 200)}`);
    diffLines.push(`  TS:   ${tsOutput.substring(0, 200)}`);
  }
  
  return diffLines.join('\n');
}
