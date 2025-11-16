#!/usr/bin/env node
/** Script to copy Java test templates and create test cases */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';

const VELOCITY_TEST_DIR = join(process.cwd(), 'vendor/velocity-engine/velocity-engine-core/src/test/resources');
const OUR_TEST_DIR = join(process.cwd(), 'tests/velocity');

// interface TestTemplate {
//   name: string;
//   template: string;
//   context: Record<string, any>;
// }

async function findTestTemplates(): Promise<string[]> {
  const templates: string[] = [];
  
  async function scanDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.name.endsWith('.vm') || entry.name.endsWith('.vtl')) {
        templates.push(fullPath);
      }
    }
  }
  
  await scanDir(VELOCITY_TEST_DIR);
  return templates;
}

async function createTestFromTemplate(templatePath: string): Promise<void> {
  const template = await readFile(templatePath, 'utf-8');
  const relativePath = templatePath.replace(VELOCITY_TEST_DIR + '/', '');
  const testName = relativePath.replace(/\.(vm|vtl)$/, '').replace(/\//g, '-');
  const testDir = join(OUR_TEST_DIR, testName);
  
  // Create test directory
  await mkdir(testDir, { recursive: true });
  
  // Write template
  await writeFile(join(testDir, 'template.vtl'), template);
  
  // Create empty context for now - we'll run Java first to see what context is needed
  const context: Record<string, any> = {};
  
  // Try to infer context from template
  // Look for variable references like $var, $obj.property, etc.
  const varMatches = template.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g);
  if (varMatches) {
    const vars = new Set<string>();
    for (const match of varMatches) {
      const varName = match.substring(1);
      // Skip built-in variables
      if (!['foreach', 'velocityCount', 'velocityHasNext'].includes(varName)) {
        vars.add(varName);
      }
    }
    
    // Create simple default values
    for (const varName of vars) {
      if (varName.includes('arr') || varName.includes('list') || varName.includes('collection')) {
        context[varName] = ['item1', 'item2', 'item3'];
      } else if (varName.includes('map')) {
        context[varName] = { key1: 'value1', key2: 'value2' };
      } else if (varName.includes('int') || varName.includes('num')) {
        context[varName] = [1, 2, 3];
      } else if (varName === 'foo' || varName === 'bar') {
        context[varName] = false;
      } else {
        context[varName] = 'test';
      }
    }
  }
  
  await writeFile(join(testDir, 'input.json'), JSON.stringify(context, null, 2));
  
  console.log(`Created test: ${testName}`);
}

async function main() {
  console.log('Copying Java test templates...\n');
  
  const templates = await findTestTemplates();
  console.log(`Found ${templates.length} templates\n`);
  
  // Create a few simple tests first
  const simpleTests = [
    'templates/vm_test1.vm',
    'templates/block.vm',
    'evaluate/eval1.vm',
  ];
  
  for (const template of templates.slice(0, 20)) {
    // Only process simple templates for now
    const relativePath = template.replace(VELOCITY_TEST_DIR + '/', '');
    if (simpleTests.includes(relativePath) || !relativePath.includes('/')) {
      try {
        await createTestFromTemplate(template);
      } catch (error) {
        console.error(`Error creating test from ${template}:`, error);
      }
    }
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
