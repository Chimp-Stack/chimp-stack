import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  outExtension: () => ({ js: '.mjs' }),
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  external: ['eslint', 'source-map', 'tsup'],
});
