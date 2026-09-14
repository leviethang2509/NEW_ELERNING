import { defineConfig } from 'tsup';

// ESM cho lang-app (Next.js), CJS cho lang-api (NestJS).
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
});
