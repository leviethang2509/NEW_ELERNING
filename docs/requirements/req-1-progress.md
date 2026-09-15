# Requirement 1 – Tiến độ

> **Phiên chat mới:** đọc [CLAUDE.md](../../CLAUDE.md) → file này → phần liên quan của [req-1-plan.md](req-1-plan.md).
> Sau mỗi step: cập nhật bảng trạng thái + thêm mục nhật ký bên dưới.
>
> Trạng thái: ✅ Xong · 🟡 Đang làm · ⬜ Chưa làm · ⛔ Bị chặn

## Bảng trạng thái

| Step | Nội dung | Trạng thái | Ngày xong | Ghi chú |
|---|---|---|---|---|
| 1 | Khởi tạo monorepo | ✅ | 2026-09-13 | Đã commit (`feat: first commit on git`) |
| 2 | Khung `lang-api` | ✅ | 2026-09-14 | Chưa commit |
| 3 | Khung `lang-app` (copy UI LC) | ✅ | 2026-09-14 | Chưa commit; chờ người dùng xem giao diện trên trình duyệt |
| 4 | Docker & deploy sớm | ⬜ | | **Step tiếp theo** – DB VPS đã sẵn sàng; kiểm chứng image qua CI (không Docker local); P3, P4 kiểm khi làm |
| 5 | Tài khoản & xác thực | ⬜ | | Có thể làm trước Step 4 nếu Step 4 còn chờ |
| 6 | Tenant, gói dịch vụ, membership (backend) | ⬜ | | |
| 7 | Dashboard hệ thống `/admin` | ⬜ | | |
| 8 | Khu vực chính & dashboard tenant cơ bản | ⬜ | | |
| 9 | `packages/exam-core` | ⬜ | | |
| 10 | Upload media (R2) | ⬜ | | Cần P1 |
| 11 | Danh mục đề & Loại đề | ⬜ | | |
| 12 | Đề thi, trình soạn thảo & version | ⬜ | | |
| 13 | Làm bài thi & chấm tự động | ⬜ | | |
| 14 | Chấm bài thủ công | ⬜ | | |
| 15 | Hoàn thiện & nghiệm thu tổng | ⬜ | | |

### Việc người dùng chuẩn bị (plan mục 3)

| # | Việc | Trạng thái |
|---|---|---|
| P1 | 2 bucket R2 (public + private), gửi `R2_PUBLIC_BASE_URL` | 🟡 Người dùng báo đã chuẩn bị; tên bucket + URL gửi lúc làm Step 10 (biến R2 chưa thêm vào env) |
| P2 | Database `lang-simulator` + user `lang_simulator` (quyền CREATE trên schema `public`); **Postgres VPS ≥ 13** | ✅ 2026-09-15: Postgres **16.15**; `lang_simulator` là owner database, không phải superuser, có CREATE trên `public`. Role ban đầu thiếu `LOGIN` → đã `ALTER ROLE … LOGIN PASSWORD` (mật khẩu ngẫu nhiên 64 ký tự, chỉ nằm trong `apps/lang-api/.env`) |
| P3 | GitHub repo `vunguyenquangit/lang-simulator` + secrets VPS/GHCR | 🟡 Người dùng báo đã chuẩn bị, chưa kiểm |
| P4 | `/opt/lang-simulator` trên VPS, mở port 3001 | 🟡 Người dùng báo đã chuẩn bị, chưa kiểm |
| P5 | Đổi mật khẩu đang lộ trong LC | ❓ Chưa xác nhận |

### Quyết định chốt ngày 2026-09-15 (đã cập nhật plan, README, CLAUDE.md)

- Dev **không dùng Postgres local** nữa: `apps/lang-api/.env` nối database `lang-simulator` trên VPS, schema `public`.
- Chưa có production. Container trên VPS (:3001, Step 4) **dùng chung** database này với máy dev.
- Step 4 vẫn làm; **không cài Docker local**, kiểm chứng image qua GitHub Actions.
- Biến R2 để đến Step 10 mới thêm.
- Database `lang_simulator_dev` tạo ở Step 2 trên Postgres local không còn dùng (chưa xoá, chỉ có bảng `typeorm_migrations`).

Kiểm tra sau khi chuyển DB (2026-09-15):
- `migrate.ts` chỉ `CREATE SCHEMA` khi chưa có; `DB_SCHEMA` mặc định `public`; `.env.example` trỏ database VPS (không chứa giá trị thật).
- `pnpm build`, `lint`, `typecheck`, `test` (29), `format:check` → OK.
- `pnpm --filter lang-api migrate` và `node dist/database/migrate.js` bằng user `lang_simulator` → tạo `public.typeorm_migrations` (owner `lang_simulator`), chạy lại báo đã mới nhất.
- `node dist/main.js` (PORT=3199) → `/api/health` 200 `{"status":"ok","database":"up"}`.

### Đang chờ người dùng (tính đến 2026-09-15)

1. Commit thay đổi của Step 2 + 3 (và thay đổi DB ngày 2026-09-15).
2. Mở `http://localhost:3100/admin` trên trình duyệt để xác nhận layout dashboard giống LC (cách vượt middleware: xem README).
3. Không bắt buộc: `REVOKE CONNECT ON DATABASE "lightc-general" FROM PUBLIC` (hiện `lang_simulator` vẫn CONNECT được DB của LC nhưng không có quyền trên bảng); giới hạn IP truy cập cổng 5432.

Đã xong ngày 2026-09-15: người dùng đổi mật khẩu superuser `admin` và cập nhật `lightc-general/backend/.env` (kết nối lại OK); `pnpm dev` đã khởi động lại với user `lang_simulator`.

---

## Nhật ký

### Step 3 – Khung `lang-app` (✅ 2026-09-14)

**Đã làm**
- Next.js 14.2.35 + React 18.3 + Tailwind 3.4, `output: 'standalone'`, `experimental.outputFileTracingRoot` = root monorepo, `transpilePackages` cho `@lang/*`, rewrite `/api/:path*` → `BACKEND_INTERNAL_URL` (mặc định `http://127.0.0.1:3101`, cố định lúc build).
- Copy từ LC: theme `globals.css` (đổi `lc-*` → `ls-*`, bỏ `.md-prose`/highlight.js, giữ style `.exam-*` cho Step 12, thêm `--danger`), `tailwind.config.ts`, fonts (Roboto, Roboto Mono, Noto Sans, Noto Sans JP), `GlobalLoadingBar`, `ui/Modal`, `ConfirmDialog`, `PromptDialog`, `Pagination`, `TagMultiSelect` (id → `string`, placeholder tham số hoá).
- `src/lib/api.ts`: viết lại từ LC – gọi cùng origin `/api`, `credentials: 'include'`, access token **trong bộ nhớ**, 401 → gọi `/auth/refresh` một lần (gộp request đồng thời) rồi thử lại, `onAuthFailure()` cho AuthProvider, `ApiError(status)`, `upload`/`postForm`.
- `DashboardShell` (sidebar 260px, header 68px như LC) + `WorkspaceSwitcher`; menu cấu hình trong `src/config/navigation.ts` theo `NavScope` (`system` / `tenant` + roles, dùng nhóm quyền của `@lang/shared`), tiêu đề header lấy từ mục menu khớp dài nhất.
- `src/i18n/vi.ts` gom chuỗi UI; `Brand` "Lang Simulator"; `StatCard`; `ComingSoon`.
- Route group và trang tạm: `(site)` (`/`, `/login`, `/register`), `(dashboard)` (`/admin`, `/t/[slug]/dashboard`), `(exam)` (`/t/[slug]/attempts/[id]`).
- `src/middleware.ts`: không có cookie `ls_rt` (`REFRESH_TOKEN_COOKIE` trong `@lang/shared`) → redirect `/login?next=…` cho `/me`, `/admin`, `/t/:slug/dashboard`, `/t/:slug/attempts`.
- ESLint: base + `@next/eslint-plugin-next@14` (bọc `fixupPluginRules` của `@eslint/compat` vì ESLint 10 đã bỏ `context.getFilename`) + `react-hooks` (chỉ `rules-of-hooks`, `exhaustive-deps`).
- `next-env.d.ts` được commit (bỏ khỏi `.gitignore`) để `typecheck` chạy được trên checkout sạch.

**Sai khác so với plan**
- Không copy các component kiểu cũ indigo/gray của LC (`button`, `input`, `table`…) – đã ghi vào plan Step 3.
- `lucide-react` khai báo `^1.34.0` (resolve 1.45.0): pnpm 11 chặn bản 1.46.0 vì quá mới (`minimumReleaseAge`), không lách bằng exclude.
- Layout đang truyền `user={null}`, `workspaces={[]}`, tenant tạm dùng roles `[TENANT_OWNER]` – thay bằng dữ liệu thật ở Step 5–8.

**Kiểm tra đã chạy**
- `pnpm build` → Next build OK (7 route + middleware 26.7 kB).
- Standalone server `apps/lang-app/.next/standalone/apps/lang-app/server.js` (cách chạy trong Docker): `/` 200; `/admin`, `/t/demo/attempts/1` không cookie → 307 `/login?next=…`; có cookie → 200, menu hệ thống (Tổng quan, Người dùng, Gói dịch vụ…) và menu tenant (Thành viên, Đề thi, Chấm bài…) đúng; `/api/health` qua rewrite → 200.
- `pnpm dev` ở root: sẵn sàng ~4s, app :3100 và api :3101 chạy song song, các kiểm tra trên đều đạt; dừng xong không còn tiến trình giữ cổng.
- **Chưa kiểm tra bằng mắt** trên trình duyệt (chỉ kiểm tra HTML) – chờ người dùng.

### Step 2 – Khung `lang-api` (✅ 2026-09-14)

**Đã làm**
- NestJS 10.4 + TypeORM 0.3.31 + pg, `nest-cli.json` (`deleteOutDir`, `tsconfig.build.json`), tsconfig kế thừa `@lang/tsconfig/nestjs.json` (thêm `rootDir`/`outDir` ở app).
- `src/main.ts`: prefix `api`, JSON body 2mb, `cookie-parser`, `ValidationPipe` (whitelist, forbidNonWhitelisted, transform), `enableShutdownHooks`, **không bật CORS** (gọi cùng origin qua rewrite).
- `src/config/env.validation.ts`: class-validator, dừng khởi động khi thiếu/sai; biến: `NODE_ENV`, `PORT` (3101), `DB_HOST/PORT/USERNAME/PASSWORD/NAME`, `DB_SCHEMA` (chỉ `[a-z0-9_]`), `DB_LOGGING`, `JWT_SECRET` (≥ 32 ký tự, không fallback).
- `src/database/database.config.ts` (dùng chung app + CLI): `schema`, `synchronize: false`, `migrationsTableName: typeorm_migrations`, `uuidExtension: 'pgcrypto'` + `installExtensions: false` (dùng `gen_random_uuid()` sẵn có từ PG 13, không cần quyền tạo extension).
- `src/database/data-source.ts` (TypeORM CLI, đọc `.env` bằng `process.loadEnvFile`), `src/database/migrate.ts` (`CREATE SCHEMA IF NOT EXISTS` → `runMigrations`, transaction từng migration), thư mục `migrations/` rỗng.
- `AllExceptionsFilter` (`{ statusCode, message }`, lỗi 500 không lộ chi tiết), `PaginationQueryDto` + `Paginated<T>` + `toSkipTake`, `@CurrentUser()` + `RequestUser` (dùng `SystemRole` của `@lang/shared`).
- `GET /api/health`: `SELECT 1`, trả `{ status, database, latencyMs }`, lỗi DB → 503.
- Scripts: `dev`, `build`, `start`, `test`, `migrate` (ts-node), `migrate:prod` (dist), `migration:generate|create|revert`.
- Jest + ts-jest: 11 test (env validation, exception filter, health controller). Chuyển các assert thủ công của Step 1 thành Jest trong `@lang/shared` (18 test).
- `.env.example`; tạo `.env` local (gitignored) với `JWT_SECRET` ngẫu nhiên; tạo database local **`lang_simulator_dev`**.

**Sai khác so với plan**
- Dev dùng **Postgres local** (`lang_simulator_dev`) – người dùng chọn; đã ghi vào plan mục 1.
- Bỏ `incremental` khỏi preset `nestjs.json`: kết hợp `deleteOutDir` làm `dist` thiếu file (lỗi `Cannot find module` khi chạy). Preset cũng bỏ `outDir` (đường dẫn tương đối bị tính theo thư mục preset) và thêm `useDefineForClassFields: false` (an toàn cho TypeORM entity).
- `@CurrentUser` làm ở Step 2 nhưng `RequestUser` có thể đổi khi làm JwtStrategy (Step 5).
- `allowBuilds`: `unrs-resolver: true` (Jest), `@nestjs/core: false`, `@parcel/watcher: false`.

**Kiểm tra đã chạy**
- `pnpm build --force`, `lint`, `typecheck`, `test` (29 test), `format:check` → tất cả OK.
- `migrate` bằng ts-node và bằng `node dist/database/migrate.js` → tạo schema `lang_simulator` + bảng `typeorm_migrations` trên `lang_simulator_dev`; chạy lại báo "đã ở phiên bản mới nhất".
- `node dist/main.js` → `/api/health` 200 `{"status":"ok","database":"up"}`; route lạ → 404 `{"statusCode":404,"message":"Cannot GET …"}`; `JWT_SECRET` rỗng → thoát code 1 với thông báo "Cấu hình môi trường không hợp lệ: JWT_SECRET…"; dừng app không để lại kết nối DB.

**Lưu ý cho các step sau**
- **Step 4 (Docker):**
  - Build lang-app phải truyền `BACKEND_INTERNAL_URL=http://127.0.0.1:3002` (đã khai báo `env` trong `turbo.json`), `NEXT_PUBLIC_API_URL=/api`.
  - Standalone server nằm ở `apps/lang-app/.next/standalone/apps/lang-app/server.js`; cần copy thêm `apps/lang-app/.next/static` và `public/` (nếu có).
  - Entrypoint: `node apps/lang-api/dist/database/migrate.js` (thoát nếu lỗi) → api `PORT=3002` → app `PORT=3000`.
  - Healthcheck nên gọi `http://127.0.0.1:3000/api/health` (kiểm tra cả app, rewrite, api, DB).
  - Máy local **không có Docker** (người dùng chọn kiểm chứng qua CI): workflow nên build image cả khi mở PR, không chỉ khi push `main`.
  - Container trên VPS nối Postgres qua network `postgres_default` (như LC), `DB_HOST` là tên container Postgres, `DB_NAME=lang-simulator`, `DB_SCHEMA=public`.
  - DB dùng chung với máy dev: migration chạy từ máy dev sẽ đi trước code trên VPS → migration phải tương thích ngược.
- **Step 5:**
  - Bảng `users` cần email unique không phân biệt hoa thường: plan ghi `citext` nhưng cần quyền tạo extension trên VPS → cân nhắc unique index trên `lower(email)` (hỏi người dùng nếu chọn khác plan).
  - Nối `DashboardShell` với AuthProvider (`user`, `workspaces`, `onLogout`); thay trang tạm `/login`, `/register`.
- **Step 6/8:** roles thật cho menu tenant thay cho `[TENANT_OWNER]` tạm trong `(dashboard)/t/[slug]/dashboard/layout.tsx`.
- Local Postgres đã có sẵn database `lang_simulator` của **dự án khác** (bảng `organizations`, `courses`, `tests`…) – không dùng, không xoá.
- Cảnh báo deprecation khi `pnpm dev` (đã biết, không phải lỗi code dự án, chưa cần xử lý):
  - `DEP0190` từ `nest start --watch` (Nest CLI spawn với `shell: true`; nạp module app trực tiếp không phát sinh);
  - `DEP0060 util._extend` từ proxy rewrite `/api` của Next 14.

### Step 1 – Khởi tạo monorepo (✅ 2026-09-13)

**Đã làm**
- `git init -b main`, `.gitignore`, `.editorconfig`, `.nvmrc` (24), `.prettierrc.json`, `.prettierignore` (bỏ qua `docs/`).
- `pnpm-workspace.yaml`: `apps/*`, `packages/*`, `catalog` phiên bản dùng chung, `allowBuilds`.
- `turbo.json`: tasks `build` (`^build`, outputs `dist`/`.next`), `dev` (persistent), `lint`, `typecheck` (`^build`), `test`, `clean`.
- Root `package.json`: `packageManager: pnpm@11.2.2`, scripts `dev/build/lint/typecheck/test/format/format:check/clean`.
- `packages/tsconfig`: `base.json`, `library.json` (Bundler, noEmit), `nestjs.json`, `nextjs.json`.
- `packages/eslint-config`: `base.js` (flat: `@eslint/js` recommended + `typescript-eslint` recommended + prettier, globals node, no-unused-vars cho phép tiền tố `_`).
- `packages/shared` (`@lang/shared`, tsup ESM + CJS + d.ts): `roles.ts`, `status.ts`, `exam.ts`, `age.ts` (+ `auth.ts` thêm ở Step 3).
- `packages/exam-core` (`@lang/exam-core`): khung rỗng.
- `README.md`, `CLAUDE.md`, file tiến độ này.

**Sai khác so với plan (đã cập nhật vào plan)**
- **Node 24 + pnpm 11** thay cho Node 20 (người dùng chọn): Node 20 EOL 4/2026, pnpm 11 cần Node ≥ 22.13.
- **ESLint 10** thay cho 9: ESLint 9.39 đã bị đánh dấu hết hỗ trợ.
- **TypeScript 5.9.3** (không lên 7.x): `typescript-eslint` chỉ hỗ trợ TS < 6.1.
