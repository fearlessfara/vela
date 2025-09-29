import typescriptPlugin from '@rollup/plugin-typescript';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import type { RollupOptions } from 'rollup';

// Cast to any to avoid TS type inference issues for plugin factory signatures
const ts = (typescriptPlugin as unknown) as (opts: any) => any;
const nodeResolve = (nodeResolvePlugin as unknown) as (opts: any) => any;

const config: RollupOptions = {
  input: 'src/browser.ts',
  output: {
    file: 'dist-browser/vela.umd.js',
    format: 'umd',
    name: 'Vela',
    sourcemap: true,
  },
  plugins: [
    ts({
      tsconfig: 'tsconfig.browser.json',
      declaration: false,
      declarationMap: false,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
  ],
  external: [],
};

export default config;

