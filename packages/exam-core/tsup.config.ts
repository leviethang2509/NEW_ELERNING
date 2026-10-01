import { defineConfig } from 'tsup';

// ESM cho lang-app (Next.js), CJS cho lang-api (NestJS).
// `pnpm dev` (watch): không xoá dist mỗi lần build – nếu xoá, app/api đang chạy
// sẽ thấy `index.cjs` mà chưa có `index.d.ts` (dts ra sau) và báo thiếu kiểu.
export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: !options.watch,
  target: 'es2022',
}));
