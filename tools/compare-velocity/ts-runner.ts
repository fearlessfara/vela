/** Apache Velocity: TypeScript Runner | OWNER: vela | STATUS: READY */

import { readFile } from 'fs/promises';
// Use dynamic import to avoid TypeScript path issues
// import { VelocityEngine } from '../../src/engine.js';

export interface TSRunnerOptions {
  templatePath: string;
  inputPath: string;
}

export async function runTSVelocity(options: TSRunnerOptions): Promise<string> {
  const { templatePath, inputPath } = options;
  
  // Read template and input files
  const template = await readFile(templatePath, 'utf-8');
  const inputJson = await readFile(inputPath, 'utf-8');
  
  // Parse context from JSON
  const context = JSON.parse(inputJson);
  
  // Dynamic import to avoid path resolution issues
  const enginePath = new URL('../../../dist/engine.js', import.meta.url);
  const { VelocityEngine } = await import(enginePath.href);
  
  // Create engine and render
  const engine = new VelocityEngine(false);
  const output = engine.render(template, context);
  
  return output;
}
