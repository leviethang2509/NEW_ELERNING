# Requirement 1 – Tiến độ

> **Phiên chat mới:** đọc [CLAUDE.md](../../CLAUDE.md) → file này → phần liên quan của [req-1-plan.md](req-1-plan.md).
> Sau mỗi step: cập nhật bảng trạng thái + thêm mục nhật ký bên dưới.
>
> Trạng thái: ✅ Xong · 🟡 Đang làm · ⬜ Chưa làm · ⛔ Bị chặn

## Bảng trạng thái

| Step | Nội dung | Trạng thái | Ngày xong | Ghi chú |
|---|---|---|---|---|
| 1 | Khởi tạo monorepo | ✅ | 2026-09-13 | Chưa commit lần đầu (chờ người dùng) |
| 2 | Khung `lang-api` | ⬜ | | **Step tiếp theo** |
| 3 | Khung `lang-app` (copy UI LC) | ⬜ | | |
| 4 | Docker & deploy sớm | ⬜ | | Cần P2, P3, P4 |
| 5 | Tài khoản & xác thực | ⬜ | | |
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
| P1 | 2 bucket R2 (public + private), gửi `R2_PUBLIC_BASE_URL` | ❓ Chưa xác nhận |
| P2 | DB user `lang_simulator` có quyền tạo schema trên database của LC | ❓ Chưa xác nhận |
| P3 | GitHub repo `vunguyenquangit/lang-simulator` + secrets VPS/GHCR | ❓ Chưa xác nhận |
| P4 | `/opt/lang-simulator` trên VPS, mở port 3001 | ❓ Chưa xác nhận |
| P5 | Đổi mật khẩu đang lộ trong LC | ❓ Chưa xác nhận |

> Hỏi người dùng trạng thái P1–P5 trước khi bắt đầu step cần chúng.

---

## Nhật ký

### Step 1 – Khởi tạo monorepo (✅ 2026-09-13)

**Đã làm**
- `git init -b main`, `.gitignore`, `.editorconfig`, `.nvmrc` (24), `.prettierrc.json`, `.prettierignore` (bỏ qua `docs/`).
- `pnpm-workspace.yaml`: `apps/*`, `packages/*`, `catalog` phiên bản dùng chung, `allowBuilds: esbuild`.
- `turbo.json`: tasks `build` (`^build`, outputs `dist`/`.next`), `dev` (persistent), `lint`, `typecheck` (`^build`), `test`, `clean`.
- Root `package.json`: `packageManager: pnpm@11.2.2`, scripts `dev/build/lint/typecheck/test/format/format:check/clean`.
- `packages/tsconfig`: `base.json`, `library.json` (Bundler, noEmit), `nestjs.json` (Node16, decorators, `strictPropertyInitialization: false`), `nextjs.json`.
- `packages/eslint-config`: `base.js` (flat: `@eslint/js` recommended + `typescript-eslint` recommended + prettier, globals node, no-unused-vars cho phép tiền tố `_`).
- `packages/shared` (`@lang/shared`, tsup ESM + CJS + d.ts):
  - `roles.ts`: `SystemRole`, `TenantRole`, nhóm quyền `SYSTEM_MANAGER_ROLES`, `TENANT_MANAGER_ROLES`, `EXAM_AUTHOR_ROLES`, `GRADER_ROLES`, `TENANT_DASHBOARD_ROLES`, `hasAnyRole()`.
  - `status.ts`: `UserStatus`, `TenantStatus`, `MembershipStatus`.
  - `exam.ts`: `ExamStatus`, `ExamSectionStatus`, `AttemptStatus`, `AttemptSectionStatus`, `QuestionGrading`, `DURATION_*` + `isValidDurationMinutes()`, `MANUAL_SCORE_MAX/STEP`.
  - `age.ts`: `ADULT_AGE`, `todayInTimeZone()`, `ageOn()`, `isAdultOn()` (tính trên chuỗi `YYYY-MM-DD`).
- `packages/exam-core` (`@lang/exam-core`): khung rỗng, cùng cấu hình build với shared.
- `README.md`, `CLAUDE.md`, file tiến độ này.

**Sai khác so với plan (đã cập nhật vào plan)**
- **Node 24 + pnpm 11** thay cho Node 20 (người dùng chọn): Node 20 EOL 4/2026, pnpm 11 cần Node ≥ 22.13.
- **ESLint 10** thay cho 9: ESLint 9.39 đã bị đánh dấu hết hỗ trợ.
- **TypeScript 5.9.3** (không lên 7.x): `typescript-eslint` chỉ hỗ trợ TS < 6.1.

**Kiểm tra đã chạy**
- `pnpm install` → OK (esbuild postinstall chạy nhờ `allowBuilds`).
- `pnpm build` → 2/2 package OK. `pnpm lint` → OK. `pnpm typecheck` → OK. `pnpm format:check` → OK.
- Import `@lang/shared` bằng CJS (`require`) và ESM (`import`) → OK; assert `ageOn` (sinh nhật đúng ngày, 29/02), `todayInTimeZone` (UTC vs `Asia/Ho_Chi_Minh` qua nửa đêm), duration 5..180, `hasAnyRole` → pass.
- File thử có `any`, `debugger`, biến thừa → ESLint báo đúng 2 lỗi + 1 cảnh báo.
- Import `@lang/exam-core` bằng CJS/ESM → OK.

**Lưu ý cho các step sau**
- **Step 2 (lang-api):**
  - dùng `@lang/tsconfig/nestjs.json` (module `Node16`); preset này **chưa được kiểm chứng** với Nest CLI, cần chỉnh nếu Nest build lỗi;
  - `bcrypt` (và `sharp` ở Step 10) cần thêm vào `allowBuilds` trong `pnpm-workspace.yaml`;
  - kiểm tra NestJS 10 chạy ổn trên Node 24;
  - thêm app thì xoá `apps/.gitkeep`.
- **Step 2/9 (test):** plan chọn Jest cho `lang-api` và `exam-core`; `@lang/shared` hiện chưa có test runner (logic tuổi mới được kiểm tra thủ công bằng node + assert). Khi dựng Jest ở Step 2, nên chuyển các assert trên thành test.
- **Step 3 (lang-app):** `eslint-config-next@14` yêu cầu ESLint 8, không dùng được. Dùng `@next/eslint-plugin-next` dạng flat config (kiểm tra tương thích ESLint 10), script lint là `eslint .` thay cho `next lint`.
- Khi `pnpm install` hiện `ERR_PNPM_IGNORED_BUILDS`: thêm package vào `allowBuilds` (true/false) thay vì chạy `pnpm approve-builds` tương tác.
- Chưa có commit nào; chưa có remote GitHub (P3).
