/** Apache Velocity: Comparator | OWNER: vela | STATUS: READY */

// Apache Velocity: Comparator

export interface ComparisonResult {
  match: boolean;
  diff?: string;
  details?: string[];
}

/**
 * Compare Java and TypeScript outputs byte-for-byte
 */
export function compareOutputs(javaOutput: string, tsOutput: string): ComparisonResult {
  if (javaOutput === tsOutput) {
    return { match: true };
  }
  
  // Generate detailed diff
  const javaLines = javaOutput.split('\n');
  const tsLines = tsOutput.split('\n');
  const maxLines = Math.max(javaLines.length, tsLines.length);
  const details: string[] = [];
  
  for (let i = 0; i < maxLines; i++) {
    const javaLine = javaLines[i] ?? '';
    const tsLine = tsLines[i] ?? '';
    
    if (javaLine !== tsLine) {
      details.push(`Line ${i + 1}:`);
      details.push(`  Java:   ${JSON.stringify(javaLine)}`);
      details.push(`  TS:     ${JSON.stringify(tsLine)}`);
    }
  }
  
  // Also compare byte-by-byte
  const javaBytes = Buffer.from(javaOutput, 'utf-8');
  const tsBytes = Buffer.from(tsOutput, 'utf-8');
  
  if (javaBytes.length !== tsBytes.length) {
    details.push(`\nLength mismatch: Java=${javaBytes.length} bytes, TS=${tsBytes.length} bytes`);
  } else {
    const firstDiff = findFirstByteDifference(javaBytes, tsBytes);
    if (firstDiff !== -1) {
      details.push(`\nFirst byte difference at offset ${firstDiff}`);
      details.push(`  Java byte: 0x${javaBytes[firstDiff]!.toString(16)}`);
      details.push(`  TS byte:   0x${tsBytes[firstDiff]!.toString(16)}`);
    }
  }
  
  return {
    match: false,
    diff: details.join('\n'),
    details,
  };
}

function findFirstByteDifference(a: Buffer, b: Buffer): number {
  const minLength = Math.min(a.length, b.length);
  for (let i = 0; i < minLength; i++) {
    if (a[i] !== b[i]) {
      return i;
    }
  }
  if (a.length !== b.length) {
    return minLength;
  }
  return -1;
}

/* Apache Velocity Comparator */
