export default {
  entry: ['src/**/*.ts'],
  dts: true,
  outDir: 'dist',
  clean: true,
  splitting: false,
  format: ['esm', 'cjs'],
  shims: false,
  sourcemap: true,
  onSuccess: 'echo ✅ Build complete',
};
