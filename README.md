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

### Tài khoản

- Người dùng thường tự đăng ký tại http://localhost:3100/register.
- System Owner đầu tiên tạo bằng seed. Database dùng chung nên **chỉ cần chạy một lần** từ máy dev; chạy lại không tạo trùng, không đổi mật khẩu:
  ```bash
  # Điền SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD, SEED_OWNER_NAME, SEED_OWNER_DOB (YYYY-MM-DD) trong apps/lang-api/.env
  pnpm --filter lang-api seed:owner
  ```
  Seed xong nên xoá `SEED_OWNER_PASSWORD` khỏi `.env`.
- Phiên: access token 15 phút (trong bộ nhớ trình duyệt) + refresh token 30 ngày (cookie httpOnly `ls_rt`). Đổi thời hạn bằng `JWT_ACCESS_EXPIRES_IN`, `REFRESH_EXPIRES_IN`; khi có HTTPS đặt `COOKIE_SECURE=true`.

- Khu vực chính: http://localhost:3100
- API: http://localhost:3101/api/health (hoặc qua rewrite http://localhost:3100/api/health)
- `lang-app` không cần file `.env` khi dev (mặc định rewrite `/api` tới `127.0.0.1:3101`, xem `apps/lang-app/.env.example`).
- `/me`, `/admin`, `/t/{slug}/dashboard`… cần đăng nhập; `/admin` chỉ dành cho System Owner/Admin.

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
docs/setup/            hướng dẫn deploy
Dockerfile             image chứa cả lang-api + lang-app
docker/entrypoint.sh   migrate → lang-api :3002 + lang-app :3000
deploy/                docker-compose.yml + .env mẫu cho VPS
.github/workflows/     build image (PR) / build + deploy (push main)
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

## Deploy

Push `main` → GitHub Actions build image `ghcr.io/vunguyenquangit/lang-simulator` và deploy lên VPS (`http://<ip-vps>:3001`). Pull request chỉ build image để kiểm tra Dockerfile. Chuẩn bị VPS, kiểm tra log, rollback: [docs/setup/deploy.md](docs/setup/deploy.md).

## Quản lý phiên bản dependency

Phiên bản dùng chung khai báo một lần trong `catalog` của [pnpm-workspace.yaml](pnpm-workspace.yaml), package dùng `"catalog:"`. Package cần chạy build script (native module…) phải được thêm vào `allowBuilds` (`true`/`false`).
