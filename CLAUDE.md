# CLAUDE.md – Lang Simulator

## Bắt đầu phiên làm việc

1. Đọc [docs/requirements/req-1-progress.md](docs/requirements/req-1-progress.md) để biết step hiện tại, việc dở dang và lưu ý.
2. Đọc phần tương ứng trong [docs/requirements/req-1-plan.md](docs/requirements/req-1-plan.md) (quyết định mục 1, giả định mục 2, thiết kế DB mục 4, phân quyền mục 5, route mục 6, step mục 7).
3. Chỉ mở [docs/requirements/req-1-question.md](docs/requirements/req-1-question.md) khi cần lý do của một quyết định.

## Quy trình

- Làm theo từng step trong plan. Kết thúc step: `pnpm build && pnpm lint && pnpm typecheck && pnpm test && pnpm format:check` phải pass, đạt tiêu chí nghiệm thu (chạy thử thật, không chỉ build), rồi **cập nhật req-1-progress.md** (trạng thái, việc đã làm, sai khác so với plan, lưu ý cho step sau).
- Yêu cầu chưa rõ hoặc mâu thuẫn: **hỏi lại người dùng, không suy đoán**. Nếu thay đổi quyết định đã chốt, cập nhật cả plan.
- Chỉ commit/push khi người dùng yêu cầu.

## Dự án tham chiếu

- `/Users/vunguyen/Projects/lightc-general` (LC): nguồn copy giao diện, Plate exam editor, simulator, grading, R2 upload, Docker/deploy.
- **Không copy** các tính năng không liên quan (vocabulary, jp-*, md-docs, gcp, labs) và **không copy giá trị trong `.env.example`/README của LC** (chứa mật khẩu thật).
- Dự án này dùng database riêng `lang-simulator` (schema `public`) trên Postgres của VPS, **dùng chung** cho máy dev và container :3001 (chưa có production). Database `lang_simulator` trên Postgres local là của dự án khác — **không đụng**.

## Quy ước chung

- Monorepo pnpm 11 + Turborepo, Node 24. Package nội bộ tên `@lang/*`, phụ thuộc bằng `workspace:*`; phiên bản dùng chung qua `catalog:` trong `pnpm-workspace.yaml`.
- Package mới có build script → khai báo trong `allowBuilds`. Không thêm `minimumReleaseAgeExclude` để lách bản phát hành quá mới; hạ version range thay thế.
- TypeScript 5.9 (strict), ESLint 10 flat config (`@lang/eslint-config/base`), Prettier (single quote, trailing comma). Jest + ts-jest (transform ép `module: CommonJS`).
- Enum dùng chung khai báo bằng object `as const` + union type trong `@lang/shared` (không dùng TS `enum`), giá trị trùng với giá trị lưu DB.
- Package trong `packages/*` build bằng tsup ra ESM (Next.js) + CJS (NestJS); app phải build package trước (turbo `dependsOn: ["^build"]` đã lo).
- Comment, message lỗi, chuỗi UI bằng tiếng Việt (giống LC).

## lang-api (NestJS)

- Env mới: thêm vào `src/config/env.validation.ts` (kiểm tra lúc khởi động, không có giá trị dự phòng cho secret) **và** `.env.example`.
- DB: schema theo env `DB_SCHEMA` (`public`), PK uuid (`gen_random_uuid`, không tự tạo extension), snake_case, entity đặt tên `*.entity.ts`, **chỉ dùng migrations** (không `synchronize`); không sửa migration đã chạy. DB dùng chung với bản trên VPS: migration phải tương thích ngược với code đang chạy trên :3001 (thêm cột/bảng trước, xoá sau).
- File dùng decorator class-transformer/class-validator mà có thể chạy ngoài Nest (script, CLI, test) phải `import 'reflect-metadata'`.
- **Không bật `incremental`** trong tsconfig của Nest: cùng `deleteOutDir` sẽ làm `dist` thiếu file. Nếu `dist` thiếu file: xoá `*.tsbuildinfo` và `pnpm build --force`.
- Lỗi trả về dạng `{ statusCode, message }` qua `AllExceptionsFilter`; không lộ chi tiết lỗi 500.

## lang-app (Next.js)

- Route group: `(site)` khu vực chính, `(dashboard)` dùng `DashboardShell`, `(exam)` toàn màn hình cho thi.
- Server component chỉ truyền dữ liệu thuần sang client component (vd. `NavScope`); menu/icon dựng trong client từ `src/config/navigation.ts`.
- Chuỗi UI đặt trong `src/i18n/vi.ts`. Màu dùng CSS variables Solarized trong `globals.css` (class tiền tố `ls-`).
- API gọi qua `src/lib/api.ts` (cùng origin `/api`, access token trong bộ nhớ, tự refresh khi 401).
- ESLint: plugin `@next/next` bản 14 phải bọc `fixupPluginRules` (ESLint 10); lint bằng `eslint .`, không dùng `next lint`.
