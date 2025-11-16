/** Apache Velocity: Test Loader | OWNER: vela | STATUS: READY */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Apache Velocity: Test Loader

export interface TestCase {
  name: string;
  templatePath: string;
  inputPath: string;
  testDir: string;
}

/**
 * Load all test cases from the tests/velocity directory
 */
export async function loadTestCases(velocityTestDir: string = 'tests/velocity'): Promise<TestCase[]> {
  const testCases: TestCase[] = [];
  const baseDir = join(process.cwd(), velocityTestDir);
  
  try {
    const entries = await readdir(baseDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const testDir = join(baseDir, entry.name);
        const templatePath = join(testDir, 'template.vtl');
        const inputPath = join(testDir, 'input.json');
        
        // Validate that both files exist
        try {
          await readFile(templatePath);
          await readFile(inputPath);
          
          testCases.push({
            name: entry.name,
            templatePath,
            inputPath,
            testDir,
          });
        } catch (error) {
          throw new Error(`Test case "${entry.name}" is missing required files (template.vtl or input.json)`);
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Test directory not found: ${baseDir}`);
    }
    throw error;
  }
  
  return testCases;
}

/**
 * Load a single test case by name
 */
export async function loadTestCase(name: string, velocityTestDir: string = 'tests/velocity'): Promise<TestCase> {
  const baseDir = join(process.cwd(), velocityTestDir);
  const testDir = join(baseDir, name);
  const templatePath = join(testDir, 'template.vtl');
  const inputPath = join(testDir, 'input.json');
  
  try {
    await readFile(templatePath);
    await readFile(inputPath);
  } catch (error) {
    throw new Error(`Test case "${name}" not found or missing required files`);
  }
  
  return {
    name,
    templatePath,
    inputPath,
    testDir,
  };
}

/* Apache Velocity Test Loader */
