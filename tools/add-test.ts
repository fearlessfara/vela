#!/usr/bin/env node
/** Test Scaffolding Tool for Velocity Tests | OWNER: vela | STATUS: READY */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface TestConfig {
  name: string;
  template: string;
  context: Record<string, any>;
  description?: string;
}

const TEMPLATES_DIR = join(process.cwd(), 'tests/velocity');

const TEMPLATE_PRESETS: Record<string, TestConfig> = {
  'directive-if': {
    name: 'directive-if',
    template: '#if($condition)\nCondition is true\n#else\nCondition is false\n#end',
    context: { condition: true },
    description: 'Basic if/else directive'
  },
  'directive-foreach': {
    name: 'directive-foreach',
    template: '#foreach($item in $items)\n$item\n#end',
    context: { items: ['apple', 'banana', 'cherry'] },
    description: 'Basic foreach loop'
  },
  'directive-set': {
    name: 'directive-set',
    template: '#set($greeting = "Hello")\n$greeting, World!',
    context: {},
    description: 'Basic set directive'
  },
  'directive-macro': {
    name: 'directive-macro',
    template: '#macro(greet $name)\nHello, $name!\n#end\n#greet("World")',
    context: {},
    description: 'Basic macro definition and invocation'
  },
  'operator-arithmetic': {
    name: 'operator-arithmetic',
    template: '#set($a = 5)\n#set($b = 3)\n$a + $b = #set($result = $a + $b)$result',
    context: {},
    description: 'Arithmetic operators'
  },
  'operator-comparison': {
    name: 'operator-comparison',
    template: '#set($x = 10)\n#if($x > 5)\nx is greater than 5\n#end',
    context: {},
    description: 'Comparison operators'
  },
  'operator-logical': {
    name: 'operator-logical',
    template: '#set($a = true)\n#set($b = false)\n#if($a && !$b)\nLogic works\n#end',
    context: {},
    description: 'Logical operators'
  },
  'reference-quiet': {
    name: 'reference-quiet',
    template: 'Regular: $undefined\nQuiet: $!undefined\nDone',
    context: {},
    description: 'Quiet reference notation'
  },
  'reference-formal': {
    name: 'reference-formal',
    template: '${greeting}World',
    context: { greeting: 'Hello' },
    description: 'Formal reference notation'
  },
  'reference-property': {
    name: 'reference-property',
    template: '$user.name is $user.age years old',
    context: { user: { name: 'Alice', age: 30 } },
    description: 'Property access'
  },
  'empty': {
    name: 'empty',
    template: '',
    context: {},
    description: 'Empty template (minimal test)'
  }
};

async function createTest(config: TestConfig): Promise<void> {
  const testDir = join(TEMPLATES_DIR, config.name);

  // Check if test already exists
  if (existsSync(testDir)) {
    console.error(`❌ Test already exists: ${config.name}`);
    console.error(`   Location: ${testDir}`);
    process.exit(1);
  }

  // Create test directory
  await mkdir(testDir, { recursive: true });

  // Write template file
  const templatePath = join(testDir, 'template.vtl');
  await writeFile(templatePath, config.template, 'utf-8');

  // Write input file
  const inputPath = join(testDir, 'input.json');
  await writeFile(inputPath, JSON.stringify(config.context, null, 2), 'utf-8');

  console.log(`✅ Created test: ${config.name}`);
  console.log(`   Template: ${templatePath}`);
  console.log(`   Input: ${inputPath}`);
  if (config.description) {
    console.log(`   Description: ${config.description}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Velocity Test Scaffolding Tool');
    console.log('==============================\n');
    console.log('Usage:');
    console.log('  npm run add-test <test-name> [options]\n');
    console.log('  node dist/tools/add-test.js <test-name> [options]\n');
    console.log('Options:');
    console.log('  --template <template>   Velocity template content');
    console.log('  --context <json>        JSON context (default: {})');
    console.log('  --preset <name>         Use a preset template\n');
    console.log('Available Presets:');
    Object.entries(TEMPLATE_PRESETS).forEach(([key, preset]) => {
      console.log(`  ${key.padEnd(25)} ${preset.description}`);
    });
    console.log('\nExamples:');
    console.log('  # Create test from preset');
    console.log('  npm run add-test operators/range --preset operator-arithmetic\n');
    console.log('  # Create custom test');
    console.log('  npm run add-test my-test --template "#set($x = 5)$x" --context \'{}\'');
    console.log('\n  # Quick test creation (minimal)');
    console.log('  npm run add-test edge-cases/null-handling --preset empty');
    console.log('  # Then edit tests/velocity/edge-cases/null-handling/template.vtl\n');
    process.exit(0);
  }

  const testName = args[0];
  const templateFlag = args.indexOf('--template');
  const contextFlag = args.indexOf('--context');
  const presetFlag = args.indexOf('--preset');

  let config: TestConfig;

  if (presetFlag !== -1 && args[presetFlag + 1]) {
    const presetName = args[presetFlag + 1];
    const preset = TEMPLATE_PRESETS[presetName];

    if (!preset) {
      console.error(`❌ Unknown preset: ${presetName}`);
      console.error(`   Available presets: ${Object.keys(TEMPLATE_PRESETS).join(', ')}`);
      process.exit(1);
    }

    config = { ...preset, name: testName };
  } else if (templateFlag !== -1 && args[templateFlag + 1]) {
    const template = args[templateFlag + 1];
    const context = contextFlag !== -1 && args[contextFlag + 1]
      ? JSON.parse(args[contextFlag + 1])
      : {};

    config = {
      name: testName,
      template,
      context
    };
  } else {
    // Default: create minimal test with empty template
    config = {
      name: testName,
      template: '## TODO: Add template content here\n',
      context: {}
    };
    console.log('ℹ️  Creating minimal test. Edit the files to add your test content.');
  }

  await createTest(config);

  console.log('\n✅ Test created successfully!');
  console.log('\nNext steps:');
  console.log(`  1. Edit tests/velocity/${testName}/template.vtl`);
  console.log(`  2. Edit tests/velocity/${testName}/input.json`);
  console.log(`  3. Run: npm run test:velocity:single ${testName}`);
  console.log(`  4. Run: npm test (to run all tests)\n`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
