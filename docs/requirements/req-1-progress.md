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
| 4 | Docker & deploy sớm | ✅ | 2026-09-15 | PR #1 đã merge; `http://160.25.166.163:3001` chạy, `/api/health` 200 |
| 5 | Tài khoản & xác thực | ✅ | 2026-09-15 | Chưa commit; migration đã chạy trên DB dùng chung; chờ người dùng seed System Owner |
| 6 | Tenant, gói dịch vụ, membership (backend) | ⬜ | | **Step tiếp theo** |
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
| P3 | GitHub repo `vunguyenquangit/lang-simulator` + secrets VPS/GHCR | ✅ 2026-09-15: workflow build, push GHCR, scp và ssh deploy đều chạy được (repo private, máy dev không có `gh`) |
| P4 | `/opt/lang-simulator` trên VPS, mở port 3001 | ✅ 2026-09-15: thư mục thuộc user `vunq` (cấp từ root), có `.env`; truy cập `:3001` từ ngoài OK |
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

1. Step 5 **chưa commit**, gồm cả các sửa tài liệu sau lần deploy đầu (`DB_HOST=postgres_db`, người dùng chọn gộp vào commit Step 5). Migration `CreateUsersAndRefreshTokens` đã chạy trên database dùng chung (chỉ thêm bảng, container :3001 bản cũ không bị ảnh hưởng); khi deploy, entrypoint sẽ báo đã mới nhất.
2. Seed System Owner đầu tiên: điền `SEED_OWNER_EMAIL/PASSWORD/NAME/DOB` trong `apps/lang-api/.env` (đã thêm dòng trống) rồi chạy `pnpm --filter lang-api seed:owner` (hoặc báo mình chạy). Seed xong xoá `SEED_OWNER_PASSWORD`.
3. Xem giao diện bằng mắt: `/login`, `/register`, `/me`, `/me/account`, `/admin` (sau khi seed Owner) – thay cho việc xem layout dashboard của Step 3. Mình mới kiểm bằng ảnh chụp Chrome headless.
4. VPS `/opt/lang-simulator/.env`: **không bắt buộc** thêm `JWT_ACCESS_EXPIRES_IN`, `REFRESH_EXPIRES_IN`, `COOKIE_SECURE` (đều có mặc định); `deploy/.env` trên máy dev đã thêm.
5. Không bắt buộc: `REVOKE CONNECT ON DATABASE "lightc-general" FROM PUBLIC` (hiện `lang_simulator` vẫn CONNECT được DB của LC nhưng không có quyền trên bảng); giới hạn IP truy cập cổng 5432.

Đã xong ngày 2026-09-15: người dùng đổi mật khẩu superuser `admin` và cập nhật `lightc-general/backend/.env` (kết nối lại OK); `pnpm dev` đã khởi động lại với user `lang_simulator`.

---

## Nhật ký

### Step 5 – Tài khoản & xác thực (✅ 2026-09-15)

**Quyết định (người dùng chọn, đã cập nhật plan mục 1, 4.1, Step 5)**
- Email: `varchar` luôn chữ thường + unique index `lower(email)` where `deleted_at is null`, không citext (Postgres VPS có citext trusted nhưng giữ quy tắc không tạo extension).
- Seed System Owner: người dùng tự điền `SEED_OWNER_*`, chạy `seed:owner` một lần từ máy dev, không chạy trong container.
- Giới tính `male` / `female` / `other`.
- Refresh token dùng lại trong 30 giây sau khi xoay vẫn được cấp token mới (nhiều tab), quá 30 giây thu hồi cả family.

**Đã làm**
- `@lang/shared`: `Gender`, `DEFAULT_LOCALE`/`DEFAULT_TIMEZONE`, `PASSWORD_MIN_LENGTH` (8) / `PASSWORD_MAX_LENGTH` (72, giới hạn bcrypt), `normalizeEmail`, `AuthUser`/`AuthResponse`, `isValidDateOfBirth` + `MIN_DATE_OF_BIRTH` (1900-01-01).
- lang-api:
  - Entity `User`, `RefreshToken`; migration `1789482175602-CreateUsersAndRefreshTokens` sinh bằng `migration:generate`, thêm tay unique index `UQ_users_email` (`@Index(..., { synchronize: false })` trên entity). Enum lưu varchar + CHECK; `refresh_tokens.user_id` FK cascade; index `token_hash` (unique), `user_id`, `family_id`.
  - `AuthModule`:
    - `POST /auth/register` (tự đăng nhập), `login`, `refresh`, `logout` (204), `GET /auth/me`, `POST /auth/change-password`.
    - Cookie `ls_rt`: httpOnly, SameSite=Lax, Path=/, Secure theo `COOKIE_SECURE`, Max-Age theo `REFRESH_EXPIRES_IN`; refresh lỗi 401 thì xoá cookie.
    - Refresh token 32 byte ngẫu nhiên, DB lưu sha256 + `family_id`, xoay mỗi lần refresh (gia hạn 30 ngày). Thu hồi token cũ bằng update có điều kiện `revoked_at IS NULL` để hai request xoay cùng lúc không ghi đè nhau. Ân hạn chỉ áp cho token bị thu hồi do xoay (`replaced_by_id` có giá trị) và family còn token hoạt động.
    - Login so bcrypt với hash giả khi email không tồn tại; tài khoản khoá → 403; dọn refresh token hết hạn của user.
    - Đổi mật khẩu: tăng `token_version`, bỏ `must_change_password`, thu hồi family khác, giữ phiên hiện tại, trả access token mới.
  - `JwtAuthGuard` (APP_GUARD): mặc định mọi route cần đăng nhập trừ `@Public()`; tải user mỗi request, so `status` + `token_version`; còn `must_change_password` → 403 trừ route `@AllowPendingPasswordChange()`. `SystemRolesGuard` + `@SystemRoles()`. `/api/health` gắn `@Public()`.
  - `UsersModule`: `PATCH /me/profile` (họ tên, ngày sinh, giới tính, SĐT, địa chỉ; chuỗi rỗng → null), `toAuthUser` (không trả `password_hash`).
  - Validator `@IsDateOfBirth()`; message validation tiếng Việt. `app.set('trust proxy', 'loopback')` để lấy IP client qua rewrite của Next.
  - Env mới (có mặc định): `JWT_ACCESS_EXPIRES_IN=15m`, `REFRESH_EXPIRES_IN=30d`, `COOKIE_SECURE=false` + `durationToSeconds`. Đã thêm vào `.env.example`, `deploy/.env.example`, `apps/lang-api/.env`, `deploy/.env`.
  - Script `seed:owner`: đọc `SEED_OWNER_*`, idempotent (Owner đã có → bỏ qua, không đổi mật khẩu), không nâng quyền tài khoản có sẵn, không in mật khẩu.
  - Test mới: `auth.service.spec` (13), `jwt-auth.guard.spec` (6), `system-roles.guard.spec` (3), `duration.spec` (2), env (+2); repository giả `src/testing/in-memory-repository.ts` (loại khỏi `tsconfig.build.json`).
- lang-app:
  - `AuthProvider` trong root layout: server truyền `hasSession` (có cookie `ls_rt`) để khỏi gọi refresh khi chắc chắn chưa đăng nhập; tải trang gọi `/auth/refresh` (nay trả cả `user`); `login`, `register`, `logout` (tải lại `/login`), `applySession`, `setUser`; `contexts` hiện chỉ có thẻ "Quản trị hệ thống" cho Owner/Admin.
  - `RequireAuth`: chưa đăng nhập → `/login?next=`; còn `must_change_password` → `/me/account`; `/admin` chỉ Owner/Admin, người khác → `/me`. `AuthedDashboardShell` cho `/admin` và dashboard tenant (roles tenant vẫn tạm); `(exam)` bọc `RequireAuth`.
  - Trang `/login`, `/register` theo design/Auth.html (tab chuyển trang, giữ `?next=`, bỏ OAuth/"ghi nhớ"/cột giới thiệu; đăng ký có thanh độ mạnh mật khẩu). `/me` tạm (thẻ quản trị hệ thống + tài khoản, "chưa là thành viên trung tâm nào"). `/me/account`: hồ sơ + đổi mật khẩu; đang bị bắt đổi mật khẩu thì chỉ hiện form đổi.
  - Header khu vực chính đổi theo trạng thái đăng nhập (`SiteHeaderNav`); `Brand` ẩn chữ trên mobile, không xuống dòng.
  - Dùng chung: `components/ui/form-styles.ts`, `PasswordInput`, `FormAlert`; `lib/auth-redirect.ts` (`safeNextPath` chặn open redirect, `destinationAfterLogin`), `lib/password-strength.ts`, `lib/initials.ts`.
- Tài liệu: README (mục Tài khoản, bỏ mẹo cookie), CLAUDE.md (quy ước migration/email/guard/test, AuthProvider/RequireAuth/form), `docs/setup/deploy.md` (env mới, không đặt `SEED_OWNER_*` trên VPS).

**Sai khác so với plan (đã cập nhật plan)**
- Các quyết định người dùng chọn ở trên (lower(email), seed, gender, ân hạn 30 giây).
- `bcryptjs` thay `bcrypt` native (khỏi build native trong image, không cần `allowBuilds`); `@nestjs/jwt` 11 (bản 12 vừa ra, không cần); guard tự viết bằng `@nestjs/jwt` thay passport `JwtStrategy`.
- Làm luôn `PATCH /me/profile` (plan mục 6.2) vì `/me/account` cần; `GET me/contexts` vẫn để Step 6.
- Chưa có giới hạn số lần đăng nhập sai (plan không yêu cầu) – cân nhắc ở Step 15.

**Kiểm tra đã chạy**
- `pnpm build`, `lint`, `typecheck`, `test` (57: 20 shared + 37 api), `format:check` → OK.
- `pnpm --filter lang-api migrate` trên database dùng chung → đã chạy migration; `migration:generate` lại → "No changes in database schema".
- Chạy bản build (api `:3101`, `next start :3100`), script Node gọi qua rewrite `/api` (31/31 đạt):
  - cookie đủ thuộc tính; email trùng khác hoa thường 409; ngày sinh tương lai, mật khẩu ngắn, field lạ (`systemRole`) → 400;
  - refresh xoay token; dùng lại cookie cũ trong 30 giây → 200; lùi `revoked_at` quá 30 giây rồi dùng lại → 401 và token mới nhất của family cũng 401;
  - đổi mật khẩu: access token cũ 401, token mới 200, phiên thiết bị khác 401 (cookie bị xoá), phiên hiện tại vẫn refresh, mật khẩu cũ không đăng nhập được;
  - **khoá user trong DB → request kế tiếp 401**, refresh 401, login 403; mở khoá không hồi sinh phiên đã thu hồi;
  - DB chỉ lưu sha256, có `ip`/`user_agent`.
- Chrome headless (puppeteer-core cài trong scratchpad, 14/14 đạt): middleware đưa `/admin` về `/login?next=%2Fadmin`; đăng ký → `/me`; **reload vẫn giữ phiên**; 2 tab tải cùng lúc đều giữ phiên; user thường vào `/admin` → `/me`; sửa hồ sơ, reload vẫn còn; đổi mật khẩu; đăng xuất rồi vào `/me` bị chặn; đăng nhập sai hiện lỗi, đúng thì theo `?next=`; System Admin thấy dashboard có tên + email; cờ `must_change_password` bắt đổi mật khẩu rồi vào `/admin`; khoá user → reload về `/login`; mobile 390px không tràn, header cao 68px.
- User test (`step5-test-…@example.com`) tạo trong DB đã xoá hết sau mỗi lần chạy (còn 0).
- Console chỉ có lỗi mong đợi: 401 khi sai mật khẩu/khoá user; 404 `favicon.ico`; 404 prefetch các mục menu `/admin/*` chưa có trang.

**Lưu ý cho các step sau**
- Guard toàn cục: route công khai mới (vd. `GET public/plans`, `public/tenants/:slug`) **phải** gắn `@Public()`.
- Step 6: `GET me/contexts` → thay `contexts` trong `AuthProvider` và bổ sung `destinationAfterLogin`; tạo account (F1-d) dùng `hashPassword` + `must_change_password = true` (guard và `RequireAuth` đã xử lý luồng bắt đổi mật khẩu).
- Step 7: khoá user có hiệu lực ngay nhờ guard kiểm `status`; reset mật khẩu nên tăng `token_version` + thu hồi refresh token. Link sidebar `/admin/*` còn 404 prefetch tới khi có trang.
- Step 8: `/me` đang là bản tạm; chưa có `favicon`.
- bcryptjs cost 12 mất khoảng 0,4 giây mỗi lần hash trên máy dev (bất đồng bộ, không chặn event loop).
- Root layout đọc cookie nên mọi route của lang-app là dynamic (ƒ).
- Script kiểm thử E2E nằm ở scratchpad phiên này (không commit); cần lâu dài thì đưa vào repo ở Step 15.

### Step 4 – Docker & deploy sớm (✅ 2026-09-15)

**Đã làm**
- `Dockerfile` 4 stage: `base` (node:24-bookworm-slim, corepack) → `prune` (`pnpm dlx turbo@2.10.12 prune lang-api lang-app --docker`) → `build` (`pnpm install --frozen-lockfile` với cache mount, `turbo run build` với `BACKEND_INTERNAL_URL=http://127.0.0.1:3002`, `NEXT_PUBLIC_API_URL=/api`, rồi `pnpm --filter lang-api deploy --prod --legacy /out/api`) → `runner` (`TZ=Asia/Ho_Chi_Minh`, `USER node`, `EXPOSE 3000`, HEALTHCHECK `fetch http://127.0.0.1:3000/api/health`, start-period 60s).
- `.dockerignore`; `docker/entrypoint.sh`: migrate (lỗi → thoát) → api `:3002` + app `:3000` (`HOSTNAME=0.0.0.0`), `wait -n` như LC.
- `deploy/docker-compose.yml`: image `ghcr.io/vunguyenquangit/lang-simulator:${IMAGE_TAG:-latest}`, container `lang-simulator-app`, `3001:3000`, network external `${DB_NETWORK}`, logging như LC.
- `deploy/.env.example` + `deploy/.env` trên máy dev (gitignored, chmod 600): `DB_HOST=postgres_db`, `DB_NETWORK=postgres-docker_default` (giống `/opt/lightc/.env`), mật khẩu `lang_simulator` như máy dev, `JWT_SECRET` mới riêng cho VPS.
- Lần deploy đầu (merge PR) lỗi `container is unhealthy`: log `Migration thất bại … getaddrinfo ENOTFOUND postgres-docker` – `DB_HOST` điền sai (đã hỏi người dùng nhưng đáp án là lựa chọn mình đưa ra, chưa kiểm trên VPS). Tên thật lấy từ `.env` của LC: container `postgres_db`. Bài học: giá trị hạ tầng VPS nên đối chiếu `/opt/lightc/.env` hoặc `docker ps` thay vì đưa lựa chọn đoán.
- `.github/workflows/deploy.yml`: PR → build không push; push `main`/chạy tay → build + push (`latest`, `sha-…`) → scp `deploy/docker-compose.yml` lên `/opt/lang-simulator` → ssh: kiểm có `.env`, login GHCR, `docker compose pull`, `up -d --wait`, `image prune`. Actions bản mới chạy node24: checkout@v7, setup-buildx@v4, login@v4, metadata@v6, build-push@v7, scp-action@v1.0.0, ssh-action@v1.2.5 (bỏ `script_stop` đã không còn, dùng `set -e`).
- `docs/setup/deploy.md` (chuẩn bị, deploy, kiểm tra, rollback, sự cố); README mục Deploy; CLAUDE.md mục Docker & deploy.

**Sai khác so với plan (đã cập nhật plan)**
- Workflow tự copy `docker-compose.yml` (người dùng chọn); `.env` VPS soạn sẵn ở `deploy/.env` (người dùng chọn).
- Không Docker local (người dùng chọn): giả lập bằng `turbo prune` + install/build/deploy trong scratchpad; thêm build image khi mở PR.
- `pnpm deploy` cần `--legacy`. Rollback bằng `IMAGE_TAG` trong `.env`.
- Network Postgres là `postgres-docker_default` (plan ghi `postgres_default`).

**Kiểm tra đã chạy**
- `turbo prune --docker` giữ nguyên `catalog`/`allowBuilds`; `pnpm install --frozen-lockfile` trên bản prune OK; build OK; rewrite trong `routes-manifest.json` trỏ `127.0.0.1:3002`; `pnpm deploy` ra `api` 119MB (có `@lang/shared`, resolve `@nestjs/core`, `pg` OK), `web` 52MB.
- Chạy như entrypoint trên layout giả lập (`NODE_ENV=production`, DB VPS qua IP): migrate OK; `/` 200; `/api/health` qua 3000 → 200 `{"status":"ok","database":"up"}`; `/admin` không cookie → 307 `/login?next=%2Fadmin`; CSS `/_next/static/…` 200; lệnh HEALTHCHECK exit 0; log không có lỗi.
- `bash -n docker/entrypoint.sh` OK; YAML workflow + compose parse OK.
- `pnpm build`, `lint`, `typecheck`, `test` (29), `format:check` → OK.
- Trên CI/VPS (PR #1 → merge `main`, 2026-09-15): image build + push GHCR OK (gồm `pnpm dlx turbo`, `COPY --chmod`, cache mount). Deploy lần 1 unhealthy do `DB_HOST` sai; sửa `/opt/lang-simulator/.env` + `docker compose up -d --force-recreate --wait` → healthy (entrypoint, `wait -n` chạy đúng).
- Từ ngoài: `:3001/` 200; `/api/health` 200 `{"status":"ok","database":"up"}`; `/admin` → 307 `/login?next=%2Fadmin`; `/api/xyz` 404; CSS tĩnh 200; LC `:3000/` vẫn 200.

**Lưu ý**
- Lỡ chạy `pnpm deploy --prod` từ repo đã ghi `"dev": false` vào `node_modules/.pnpm-workspace-state-v1.json` → `pnpm exec` đòi cài lại production. Khôi phục bằng `pnpm install --frozen-lockfile` (đã ghi vào CLAUDE.md).
- `deploy/.env` chứa secret thật: không commit, không đưa vào image (`.dockerignore` loại `deploy`, `**/.env`).

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
