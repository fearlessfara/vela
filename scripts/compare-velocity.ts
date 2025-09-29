import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

type CaseResult = { name: string; output: string };

function runJava(casesRoot: string): CaseResult[] {
  const mvn = spawnSync('mvn', ['-q', '-f', 'tools/velocity-java-runner/pom.xml', '-DskipTests', 'package'], { stdio: 'inherit' });
  if (mvn.status !== 0) throw new Error('Failed to build Java runner');
  const jarPath = 'tools/velocity-java-runner/target/velocity-java-runner-1.0.0-jar-with-dependencies.jar';
  const proc = spawnSync('java', ['-jar', jarPath, casesRoot], { encoding: 'utf8' });
  if (proc.status !== 0) {
    console.error(proc.stderr);
    throw new Error('Failed to run Java runner');
  }
  const out = proc.stdout.trim();
  return JSON.parse(out) as CaseResult[];
}

async function runTs(casesRoot: string): Promise<CaseResult[]> {
  const dynamicImport: any = (new Function('u', 'return import(u)')) as any;
  const mod = await dynamicImport('../../packages/core/dist/index.js');
  const engine = new mod.CoreVtlEngine();
  const dirs = readdirSync(casesRoot, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  const results: CaseResult[] = [];
  for (const name of dirs) {
    const dir = join(casesRoot, name);
    const tpl = readFileSync(join(dir, 'template.vtl'), 'utf8');
    const ctxPath = join(dir, 'context.json');
    const ctx = existsSync(ctxPath) ? JSON.parse(readFileSync(ctxPath, 'utf8')) : {};
    const result = engine.renderTemplate({ template: tpl, context: ctx });
    results.push({ name, output: result.output });
  }
  return results;
}

function diff(a: string, b: string): string | null {
  if (a === b) return null;
  const al = a.split(/\r?\n/);
  const bl = b.split(/\r?\n/);
  const max = Math.max(al.length, bl.length);
  const lines: string[] = [];
  for (let i = 0; i < max; i++) {
    const l = (al[i] ?? '');
    const r = (bl[i] ?? '');
    if (l !== r) {
      lines.push(`- ${l}`);
      lines.push(`+ ${r}`);
    }
  }
  return lines.join('\n');
}

async function main() {
  const casesRoot = 'comparisons/velocity/cases';
  const javaResults = runJava(casesRoot);
  const tsResults = await runTs(casesRoot);
  const mapTs = new Map(tsResults.map(r => [r.name, r.output]));

  let passed = 0, failed = 0;
  for (const jr of javaResults) {
    const tsOut = mapTs.get(jr.name) ?? '';
    const d = diff(tsOut, jr.output);
    if (d === null) {
      console.log(`OK  ${jr.name}`);
      passed++;
    } else {
      console.log(`DIFF ${jr.name}`);
      console.log(d);
      failed++;
    }
  }
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
