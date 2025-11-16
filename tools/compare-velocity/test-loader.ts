/** Apache Velocity: Test Loader | OWNER: vela | STATUS: READY */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface TestCase {
  name: string;
  templatePath: string;
  inputPath: string;
  testDir: string;
}

export async function loadTestCases(testDir: string = 'tests/velocity'): Promise<TestCase[]> {
  const testCases: TestCase[] = [];
  const basePath = join(process.cwd(), testDir);

  try {
    const entries = await readdir(basePath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const testName = entry.name;
      const testCaseDir = join(basePath, testName);
      const templatePath = join(testCaseDir, 'template.vtl');
      const inputPath = join(testCaseDir, 'input.json');

      // Validate that both files exist
      try {
        await readFile(templatePath);
        await readFile(inputPath);
        
        testCases.push({
          name: testName,
          templatePath,
          inputPath,
          testDir: testCaseDir,
        });
      } catch (error) {
        throw new Error(
          `Test case "${testName}" is missing required files. ` +
          `Expected: ${templatePath} and ${inputPath}`
        );
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Directory doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }

  return testCases;
}
