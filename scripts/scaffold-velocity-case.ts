import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

function usage() {
  console.log(
    [
      'Usage: scaffold-velocity-case <name> [--casesRoot <path>] [--force]',
      '',
      'Examples:',
      '  node dist/scripts/scaffold-velocity-case.js my-case',
      '  npm run compare:velocity:new -- my-case',
      '  npm run compare:velocity:new -- my-case --casesRoot comparisons/velocity/cases',
    ].join('\n')
  );
}

type Args = { name: string | undefined; casesRoot: string; force: boolean };

function parseArgs(argv: string[]): Args {
  const out: Args = { name: undefined, casesRoot: 'comparisons/velocity/cases', force: false };
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--casesRoot' && argv[i + 1]) { out.casesRoot = argv[++i]!; continue; }
    if (a === '--force') { out.force = true; continue; }
    if (a.startsWith('-')) continue;
    positional.push(a);
  }
  out.name = positional[0];
  out.casesRoot = resolve(out.casesRoot);
  return out;
}

function isValidName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name) {
    usage();
    process.exit(1);
  }
  const name = args.name!;
  if (!isValidName(name)) {
    console.error('Error: name must match /^[a-z0-9][a-z0-9-]*$/.');
    process.exit(1);
  }

  const dir = join(args.casesRoot, name);
  const tplPath = join(dir, 'template.vtl');
  const ctxPath = join(dir, 'context.json');

  if (existsSync(dir) && !args.force) {
    console.error(`Error: case directory already exists: ${dir}`);
    console.error('Use --force to overwrite files.');
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });

  const defaultTemplate = `Hello, Velocity!`;
  const defaultContext = `{}\n`;

  if (!existsSync(tplPath) || args.force) {
    writeFileSync(tplPath, defaultTemplate, 'utf8');
  }
  if (!existsSync(ctxPath) || args.force) {
    writeFileSync(ctxPath, defaultContext, 'utf8');
  }

  console.log(`Scaffolded case: ${name}`);
  console.log(`- ${tplPath}`);
  console.log(`- ${ctxPath}`);
  console.log('Next:');
  console.log(`- Edit template/context and run: npm run compare:velocity -- --only ${name}`);
}

main();
