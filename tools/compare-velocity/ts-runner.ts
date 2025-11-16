/** Apache Velocity: TypeScript Runner | OWNER: vela | STATUS: READY */

import { readFile } from 'fs/promises';
import { VelocityEngine } from '../../src/engine.js';

// Apache Velocity: TypeScript Runner

/**
 * Run TypeScript Velocity engine with template and context
 */
export async function runTypeScriptVelocity(
  templatePath: string,
  inputPath: string
): Promise<string> {
  try {
    // Read template and input
    const template = await readFile(templatePath, 'utf-8');
    const inputJson = await readFile(inputPath, 'utf-8');
    const context = JSON.parse(inputJson);
    
    // Create engine and render
    const engine = new VelocityEngine();
    const output = engine.render(template, context);
    
    return output;
  } catch (error) {
    throw new Error(`Failed to run TypeScript Velocity: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* Apache Velocity TypeScript Runner */
