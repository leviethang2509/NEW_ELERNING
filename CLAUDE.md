# CLAUDE.md – Lang Simulator

## Bắt đầu phiên làm việc

1. Đọc [docs/requirements/req-1-progress.md](docs/requirements/req-1-progress.md) để biết step hiện tại, việc dở dang và lưu ý.
2. Đọc phần tương ứng trong [docs/requirements/req-1-plan.md](docs/requirements/req-1-plan.md) (quyết định mục 1, giả định mục 2, thiết kế DB mục 4, phân quyền mục 5, route mục 6, step mục 7).
3. Chỉ mở [docs/requirements/req-1-question.md](docs/requirements/req-1-question.md) khi cần lý do của một quyết định.

## Quy trình

- Làm theo từng step trong plan. Kết thúc step: `pnpm build && pnpm lint && pnpm typecheck` (và `pnpm test` khi có) phải pass, đạt tiêu chí nghiệm thu, rồi **cập nhật req-1-progress.md** (trạng thái, việc đã làm, sai khác so với plan, lưu ý cho step sau).
- Yêu cầu chưa rõ hoặc mâu thuẫn: **hỏi lại người dùng, không suy đoán**. Nếu thay đổi quyết định đã chốt, cập nhật cả plan.
- Chỉ commit/push khi người dùng yêu cầu.

## Dự án tham chiếu

- `/Users/vunguyen/Projects/lightc-general` (LC): nguồn copy giao diện, Plate exam editor, simulator, grading, R2 upload, Docker/deploy.
- **Không copy** các tính năng không liên quan (vocabulary, jp-*, md-docs, gcp, labs) và **không copy giá trị trong `.env.example`/README của LC** (chứa mật khẩu thật).

## Quy ước

- Monorepo pnpm 11 + Turborepo, Node 24. Package nội bộ tên `@lang/*`, phụ thuộc bằng `workspace:*`; phiên bản dùng chung qua `catalog:` trong `pnpm-workspace.yaml`.
- TypeScript 5.9 (strict), ESLint 10 flat config (`@lang/eslint-config/base`), Prettier (single quote, trailing comma).
- Enum dùng chung khai báo bằng object `as const` + union type trong `@lang/shared` (không dùng TS `enum`), giá trị trùng với giá trị lưu DB.
- Package trong `packages/*` build bằng tsup ra ESM (Next.js) + CJS (NestJS); app phải build package trước (turbo `dependsOn: ["^build"]` đã lo).
- Comment, message lỗi, chuỗi UI bằng tiếng Việt (giống LC).
- DB: schema `lang_simulator`, PK uuid, snake_case, migrations (không `synchronize`).
