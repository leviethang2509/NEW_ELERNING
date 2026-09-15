# Lang Simulator

Nền tảng multi-tenant quản lý trung tâm ngoại ngữ: tài khoản & phân quyền, tenant/membership, soạn đề thi (Plate.js), giả lập thi và chấm điểm.

- Yêu cầu: [docs/requirements/req-1.md](docs/requirements/req-1.md)
- Kế hoạch: [docs/requirements/req-1-plan.md](docs/requirements/req-1-plan.md)
- Tiến độ: [docs/requirements/req-1-progress.md](docs/requirements/req-1-progress.md)

## Yêu cầu môi trường

- Node **24** (`nvm use`, xem `.nvmrc`)
- pnpm **11** (`corepack enable` hoặc `npm i -g pnpm@11`)
- Truy cập database `lang-simulator` trên Postgres của VPS (≥ 13, dùng `gen_random_uuid()` có sẵn). Máy dev và bản chạy trên VPS dùng chung database này.

## Chạy local lần đầu

```bash
pnpm install

# Cấu hình lang-api: điền DB_HOST, DB_PASSWORD (hỏi người quản trị), JWT_SECRET
cp apps/lang-api/.env.example apps/lang-api/.env
openssl rand -base64 48   # dán kết quả vào JWT_SECRET

# Chạy migration (schema public đã có sẵn)
pnpm build
pnpm --filter lang-api migrate

pnpm dev
```

- Khu vực chính: http://localhost:3100
- API: http://localhost:3101/api/health (hoặc qua rewrite http://localhost:3100/api/health)
- `lang-app` không cần file `.env` khi dev (mặc định rewrite `/api` tới `127.0.0.1:3101`, xem `apps/lang-app/.env.example`).

> Trước khi có trang đăng nhập (Step 5), middleware chuyển `/admin`, `/t/{slug}/dashboard`… về `/login`. Muốn xem thử layout dashboard, mở DevTools console chạy `document.cookie = 'ls_rt=dev; path=/'` rồi tải lại trang.

## Cấu trúc

```
apps/
  lang-app/            Next.js 14 – khu vực chính + dashboard
  lang-api/            NestJS 10 – REST API /api
packages/
  shared/              @lang/shared – enum role/trạng thái, hằng số, helper dùng chung
  exam-core/           @lang/exam-core – cấu trúc đề, parse đáp án, chấm điểm (Step 9)
  tsconfig/            @lang/tsconfig – preset base / library / nestjs / nextjs
  eslint-config/       @lang/eslint-config – ESLint flat config dùng chung
docs/requirements/     yêu cầu, câu hỏi, kế hoạch, tiến độ
```

## Lệnh thường dùng

```bash
pnpm dev              # chạy toàn bộ ở chế độ dev (app :3100, api :3101)
pnpm build            # build mọi package/app (Turborepo, có cache; thêm --force để bỏ cache)
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # Jest (@lang/shared, lang-api)
pnpm format           # Prettier ghi đè / pnpm format:check để kiểm tra
pnpm --filter <package> <script>   # chạy script cho một package, vd. --filter lang-api test
```

### Migration (lang-api)

```bash
pnpm --filter lang-api migrate                                              # tạo schema DB_SCHEMA nếu chưa có + chạy migration
pnpm --filter lang-api migration:generate src/database/migrations/<TenMigration>  # sinh từ thay đổi entity
pnpm --filter lang-api migration:revert                                     # hoàn tác migration cuối
```

Production chạy `node dist/database/migrate.js` khi container khởi động.

## Port

| Môi trường | lang-app                   | lang-api                |
| ---------- | -------------------------- | ----------------------- |
| Local      | 3100                       | 3101                    |
| VPS        | host 3001 → container 3000 | 3002 (nội bộ container) |

## Quản lý phiên bản dependency

Phiên bản dùng chung khai báo một lần trong `catalog` của [pnpm-workspace.yaml](pnpm-workspace.yaml), package dùng `"catalog:"`. Package cần chạy build script (native module…) phải được thêm vào `allowBuilds` (`true`/`false`).
