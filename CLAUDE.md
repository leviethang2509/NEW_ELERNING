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

## exam-core (`@lang/exam-core`)

- Logic thuần dữ liệu của đề (chuyển từ LC), **không phụ thuộc platejs/React**; kiểu tài liệu là `ExamElement`/`ExamValue`. Plugin Plate và UI editor/simulator ở lang-app. Đánh số câu luôn theo `buildPlan` (từ 1 mỗi section).
- Luồng server: Save → `validateSectionShape` (lỗi thì 400), `extractStructure` (→ `exam_parts`/`exam_questions`), `stripAnswers(value, seedNgẫuNhiên)` (→ `content_public`); publish → `hasErrors(validateSection(raw))` thì 422; phục vụ lượt làm → `shuffleOrdering(content_public, order_seed, questions)`; nộp → `gradeResponses(questions, responses)` (câu hỏi dựng từ dòng `exam_questions`). Preview client dùng `gradeExam(plan, responses)` – cùng logic.
- Câu trả lời (`Responses`): `value`/`picks`/`order` theo số câu (pick-n, MC, ordering, polytomous theo số câu đầu). Ordering/Polytomous dùng `key` của dòng trong content_public, không dùng vị trí hiển thị; lựa chọn cặp ghép lấy từ `pairChoices`.
- Test đối chiếu `gradeExam` gốc của LC nằm ở `src/testing/lc-grading.ts`; đổi quy tắc chấm có chủ đích thì sửa cả bản đó và ghi lý do. Fixture trong `src/__fixtures__` (prettier bỏ qua).

## lang-api (NestJS)

- Env mới: thêm vào `src/config/env.validation.ts` (kiểm tra lúc khởi động, không có giá trị dự phòng cho secret) **và** `.env.example`.
- DB: schema theo env `DB_SCHEMA` (`public`), PK uuid (`gen_random_uuid`, không tự tạo extension), snake_case, entity đặt tên `*.entity.ts`, **chỉ dùng migrations** (không `synchronize`); không sửa migration đã chạy. DB dùng chung với bản trên VPS: migration phải tương thích ngược với code đang chạy trên :3001 (thêm cột/bảng trước, xoá sau).
- Migration: `migration:generate` rồi đọc lại; index/constraint entity không khai báo được (vd. unique `lower(email)`) thì thêm tay và gắn `@Index(name, { synchronize: false })` trên entity. Chạy migration xong, `migration:generate` lần nữa phải báo "No changes". Enum lưu `varchar` + `@Check` (tương thích ngược hơn Postgres enum).
- Email: luôn qua `normalizeEmail` (`@lang/shared`), unique theo `lower(email)` bỏ qua user đã xoá mềm (không dùng citext).
- Xác thực: `JwtAuthGuard` + `SystemRolesGuard` là **guard toàn cục**, route mặc định cần đăng nhập. Route công khai gắn `@Public()`; route vẫn gọi được khi user còn `must_change_password` gắn `@AllowPendingPasswordChange()`; giới hạn role hệ thống bằng `@SystemRoles(...)`. Không trả entity `User` ra client, dùng `toAuthUser`.
- Tenant: route `/t/:slug/*` gắn `@UseGuards(TenantGuard)` + `@TenantRoles(...)` ở controller, đọc `@TenantCtx()` và **luôn lọc theo `ctx.tenantId`**; module import `TenantsModule` (có repository guard cần). System Owner/Admin không được bỏ qua `TenantGuard`. Giới hạn gói kiểm trong transaction có khoá dòng tenant (`assertPlanHasRoom`; số liệu gói qua `MembershipsService.getQuota`). `TenantGuard` ghi `memberships.last_active_at` (≤ 1 lần/giờ) cho mọi request qua guard, kể cả bị chặn vì thiếu role.
- Admin: controller `/admin/*` gắn `@SystemRoles(...SYSTEM_MANAGER_ROLES)`; quyền trên tài khoản dùng `canManageUser` (`@lang/shared`) ở cả API lẫn UI (System Admin chỉ thao tác Registered User). Req-1 không xoá user. Chuyển trạng thái (tenant…) bằng update có điều kiện trạng thái cũ, không khớp thì 409.
- Helper dùng chung: `sqlInList` (CHECK enum), `escapeLike`, `isUniqueViolation`/`isForeignKeyViolation` (đổi thành 409), `ParseIdPipe()` cho param uuid, transform `trimToNull`/`toEmail`/`emptyToUndefined`, decorator trường trong `common/validators/fields.ts` (`EmailField`, `FullNameField`, `PhoneField`…, `composeDecorators`, `isPresent` cho PATCH), validator `NewPassword`/`IsDateOfBirth`.
- Unit test service dùng `src/testing/in-memory-repository.ts` (không kết nối DB dùng chung); service có transaction dùng `in-memory-data-source.ts` (**không rollback**: chỉ kiểm lỗi xảy ra trước khi ghi); `jest.mock('../auth/password')` để khỏi chạy bcrypt thật. Giả giờ bằng `fakeDate()` (`src/testing/fake-clock.ts`, chỉ giả `Date` vì jsonwebtoken cần `nextTick`/`setImmediate` thật).
- Media/R2: `StorageModule` export `R2Service` (2 bucket – `public` cho media đề & logo, `private` cho ghi âm) và `MediaService`. Thiếu biến `R2_*` thì mọi thao tác trả **501**, API vẫn khởi động. Key `tenants/{tenantId}/exam-media/…` và `users/{userId}/branding/…` (logo đặt theo user vì lúc đăng ký chưa có tenant); xoá luôn kiểm key thuộc prefix của tenant. Ảnh convert webp bằng `sharp`, audio/video giữ nguyên.
- File dùng decorator class-transformer/class-validator mà có thể chạy ngoài Nest (script, CLI, test) phải `import 'reflect-metadata'`.
- **Không bật `incremental`** trong tsconfig của Nest: cùng `deleteOutDir` sẽ làm `dist` thiếu file. Nếu `dist` thiếu file: xoá `*.tsbuildinfo` và `pnpm build --force`.
- Lỗi trả về dạng `{ statusCode, message }` qua `AllExceptionsFilter`; không lộ chi tiết lỗi 500.

## lang-app (Next.js)

- Route group: `(site)` khu vực chính, `(dashboard)` dùng `DashboardShell`, `(exam)` toàn màn hình cho thi.
- Server component chỉ truyền dữ liệu thuần sang client component (vd. `NavScope`); menu/icon dựng trong client từ `src/config/navigation.ts`.
- Chuỗi UI đặt trong `src/i18n/vi.ts`. Màu dùng CSS variables Solarized trong `globals.css` (class tiền tố `ls-`).
- API gọi qua `src/lib/api.ts` (cùng origin `/api`, access token trong bộ nhớ, tự refresh khi 401).
- Media: `lib/media-api.ts`, `MediaDialog` (upload hoặc dán URL, dùng lại ở trình soạn đề), `LogoPicker`, trang Thư viện media `/t/{slug}/dashboard/media`. Chép URL bằng `lib/clipboard.ts` (VPS chạy HTTP nên `navigator.clipboard` không có, phải có đường lùi). Ảnh từ R2 hiển thị bằng `<img>`, không dùng `next/image`.
- Phiên đăng nhập: `useAuth()` từ `AuthProvider` (root layout). Trang cần đăng nhập bọc `RequireAuth` (`/me/*`, `(exam)`), dashboard dùng `AuthedDashboardShell`. `tenantContexts`/`contexts` (switcher) lấy từ `GET /me/contexts`, chờ `contextsReady`; tự đổi membership của mình (đăng ký tenant, sửa role) thì gọi `reloadContexts()`. Chuyển trang sau đăng nhập/đổi mật khẩu bắt buộc bằng `useRedirectAfterLogin` (quy tắc trong `destinationAfterLogin`, `src/lib/auth-redirect.ts`).
- Dashboard tenant: layout `TenantDashboardShell` (roles thật, chặn Student/Parent/tenant chưa hoạt động bằng `TenantNotice`); trang con lấy tenant/roles qua `useTenantDashboard()`. Component dùng chung của tenant trong `src/components/tenant` (`TenantNotice`, `TenantAvatar`, `OverLimitBanner`, `TENANT_STATUS_TONE`).
- Link tới route middleware chặn (`/me/*`…) ở chỗ khách nhìn thấy phải `prefetch={false}`: prefetch lúc chưa đăng nhập nhận redirect `/login`, router cache giữ lại và đẩy user về `/login` ngay sau khi đăng nhập.
- `Modal` lồng nhau: chỉ modal mở sau cùng nhận Esc.
- Form: `inputClass`/`labelClass`/`primaryButtonClass`, `PasswordInput`, `FormAlert`, `SectionCard` trong `src/components/ui`; nút trong dialog/toolbar dùng `compactPrimaryButtonClass`/`secondaryButtonClass`/`iconButtonClass`.
- Trang danh sách dashboard: `DataTable` (truyền nguyên văn class `sm:grid-cols-[…]`) + `SearchInput`/`SelectFilter` + `Pagination`, trạng thái bằng `Badge`, mật khẩu tạm hiện bằng `TemporaryPasswordDialog`. Lỗi API qua `errorMessage` (`lib/error-message.ts`), ngày giờ/giá/số qua `lib/format.ts`. Page đọc query bằng prop `searchParams`.
- ESLint: plugin `@next/next` bản 14 phải bọc `fixupPluginRules` (ESLint 10); lint bằng `eslint .`, không dùng `next lint`.

## Docker & deploy

- Hướng dẫn: [docs/setup/deploy.md](docs/setup/deploy.md). Image: `turbo prune` → `pnpm install --frozen-lockfile` → `turbo run build` (`BACKEND_INTERNAL_URL=http://127.0.0.1:3002`) → `pnpm --filter lang-api deploy --prod --legacy`; runner chạy `docker/entrypoint.sh` (migrate → api :3002 + app :3000).
- Đổi phiên bản `turbo` trong catalog thì sửa cả `pnpm dlx turbo@…` trong `Dockerfile`.
- Env mới cần ở production: thêm vào `deploy/.env.example` và nhắc người dùng cập nhật `/opt/lang-simulator/.env` trên VPS. `deploy/.env` trên máy dev chứa secret thật, gitignored, không commit.
- Máy dev **không có Docker**: kiểm Dockerfile bằng PR (workflow chỉ build) hoặc giả lập trong scratchpad: `turbo prune --docker` → install/build/deploy trong `out` → chạy các lệnh như entrypoint với cổng 3000/3002. **Không chạy `pnpm deploy --prod` từ repo**: nó ghi `"dev": false` vào `node_modules/.pnpm-workspace-state-v1.json`, sau đó mọi `pnpm exec/run` đòi cài lại bản production (xoá devDependencies). Lỡ chạy thì `pnpm install --frozen-lockfile` để khôi phục.
- Workflow tự copy `deploy/docker-compose.yml` lên `/opt/lang-simulator` mỗi lần deploy; push `main` = deploy, chỉ push khi người dùng yêu cầu.
