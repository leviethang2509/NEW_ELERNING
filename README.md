# Lang Simulator

Nền tảng multi-tenant quản lý trung tâm ngoại ngữ: tài khoản & phân quyền, tenant/membership, soạn đề thi (Plate.js), giả lập thi và chấm điểm.

- Yêu cầu: [docs/requirements/req-1.md](docs/requirements/req-1.md)
- Kế hoạch: [docs/requirements/req-1-plan.md](docs/requirements/req-1-plan.md)
- Tiến độ: [docs/requirements/req-1-progress.md](docs/requirements/req-1-progress.md)

## Yêu cầu môi trường

- Node **24** (`nvm use`, xem `.nvmrc`)
- pnpm **11** (`corepack enable` hoặc `npm i -g pnpm@11`)

## Cấu trúc

```
apps/
  lang-app/            Next.js 14 – khu vực chính + dashboard (Step 3)
  lang-api/            NestJS 10 – REST API /api (Step 2)
packages/
  shared/              @lang/shared – enum role/trạng thái, hằng số, helper dùng chung
  exam-core/           @lang/exam-core – cấu trúc đề, parse đáp án, chấm điểm (Step 9)
  tsconfig/            @lang/tsconfig – preset base / library / nestjs / nextjs
  eslint-config/       @lang/eslint-config – ESLint flat config dùng chung
docs/requirements/     yêu cầu, câu hỏi, kế hoạch, tiến độ
```

## Lệnh thường dùng

```bash
pnpm install          # cài dependencies
pnpm dev              # chạy toàn bộ ở chế độ dev (app :3100, api :3101)
pnpm build            # build mọi package/app (Turborepo, có cache)
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # test
pnpm format           # Prettier ghi đè / pnpm format:check để kiểm tra
pnpm --filter @lang/shared build   # chạy lệnh cho một package
```

## Port

| Môi trường | lang-app                   | lang-api                |
| ---------- | -------------------------- | ----------------------- |
| Local      | 3100                       | 3101                    |
| VPS        | host 3001 → container 3000 | 3002 (nội bộ container) |

## Quản lý phiên bản dependency

Phiên bản dùng chung khai báo một lần trong `catalog` của [pnpm-workspace.yaml](pnpm-workspace.yaml), package dùng `"catalog:"`. Package cần chạy build script (native module…) phải được thêm vào `allowBuilds`.
