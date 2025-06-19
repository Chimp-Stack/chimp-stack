import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils/index.ts',
    'src/utils/changelog/index.ts',
    'src/utils/logger.ts',
    'src/utils/openai.ts',
    'src/config.ts',
    'src/env.ts',
    'src/types/config.ts',
    'src/cli/index.ts',
    'src/cli/config.ts',
    'src/cli/init.ts',
    'src/cli/addChimpConfigCommand.ts',
    'src/cli/changelog.ts',
  ],
  dts: true,
  outDir: 'dist',
  clean: true,
  format: ['esm', 'cjs'],
  sourcemap: true,
  shims: false,
  splitting: false,
  onSuccess: 'echo ✅ Build complete',
});
