/** Apache Velocity: Test Loader | OWNER: vela | STATUS: READY */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface TestCase {
  name: string;
  templatePath: string;
  inputPath: string;
  testDir: string;
}

async function findTestCasesRecursive(basePath: string, relativePath: string = ''): Promise<TestCase[]> {
  const testCases: TestCase[] = [];
  const currentPath = join(basePath, relativePath);

  try {
    const entries = await readdir(currentPath, { withFileTypes: true });

    // Check if this directory itself is a test case
    const templatePath = join(currentPath, 'template.vtl');
    const inputPath = join(currentPath, 'input.json');

    let isTestCase = false;
    try {
      await readFile(templatePath);
      await readFile(inputPath);
      isTestCase = true;
    } catch {
      // Not a test case, that's fine
    }

    if (isTestCase) {
      // This is a test case directory
      testCases.push({
        name: relativePath || currentPath,
        templatePath,
        inputPath,
        testDir: currentPath,
      });
    }

    // Always check subdirectories, even if this is a test case
    // (allows for legacy test structure where both operators/ is a test
    // and operators/comparison-eq/ is also a test)
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = relativePath ? join(relativePath, entry.name) : entry.name;
        const subTests = await findTestCasesRecursive(basePath, subPath);
        testCases.push(...subTests);
      }
    }
  } catch (error) {
    // Ignore errors for individual directories
  }

  return testCases;
}

export async function loadTestCases(testDir: string = 'tests/velocity'): Promise<TestCase[]> {
  const basePath = join(process.cwd(), testDir);

  try {
    return await findTestCasesRecursive(basePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Directory doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }
}
