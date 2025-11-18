import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/browser.ts',
  output: {
    file: 'dist-browser/velocits.umd.js',
    format: 'umd',
    name: 'Velocits',
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.browser.json',
      declaration: false,
      declarationMap: false
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    })
  ],
  external: []
};
