# Requirement 4 – Tiến độ

> **Phiên chat mới:** đọc [CLAUDE.md](../../CLAUDE.md) → file này → phần liên quan của [req-4-plan.md](req-4-plan.md).
> Sau mỗi step: cập nhật bảng trạng thái + thêm mục nhật ký bên dưới.
>
> Trạng thái: ✅ Xong · 🟡 Đang làm · ⬜ Chưa làm · ⛔ Bị chặn

## Bảng trạng thái

| Step | Nội dung | Trạng thái | Ngày xong | Ghi chú |
|---|---|---|---|---|
| 0 | Câu hỏi + plan | ✅ | 2026-09-23 | 4 câu chặn đã chốt (A1 3 theme, B1 cookie, B2 có "Theo hệ thống", C2 chỉ ở màn giới thiệu section); A2/A3/C1/D1–D6 đi theo Đề xuất |
| 1 | Nền tảng theme (token 3 theme, cookie, `ThemeToggle`, chống nháy) | ✅ | 2026-09-23 | Chưa commit. Dark mode **đổi được** nhưng chưa dọn màu cứng – Step 2 mới sạch |
| 2 | Dọn màu cứng sang token (~70 `rgba` + hex, 33 file) + ESLint chặn tái phát | ✅ | 2026-09-25 | Chưa commit. Không còn màu cứng nào ngoài 5 file bảng màu trong danh sách cho phép |
| 3 | Rà theme tối: khu vực chính, dashboard, docs | ⬜ | | |
| 4 | Rà theme tối: soạn thảo, thi, chấm bài, lịch | ⬜ | | |
| 5 | Tài liệu `/user-manual`, `CLAUDE.md`, nghiệm thu, epic-1 | ⬜ | | |

## Nhật ký

### Step 0 – Câu hỏi & plan (2026-09-23)

Quét source trước khi hỏi, kết quả quyết định phạm vi:

- **1.673 lượt `var(--…)`** trong 253 file → thêm khối `:root[data-theme='…']` là đổi được gần hết giao diện, **không sửa dòng nào** ở các file đó.
- **~70 `rgba(...)` viết thẳng** (33 file) là phần việc thật: lớp phủ mờ tính theo nền sáng, sang nền tối sẽ mất hút. Đã nhóm thành token ở plan mục 4.2.
- ~46 hex (7 file) phần lớn là màu nhấn Solarized – dùng chung được cả sáng lẫn tối; chỉ vài chỗ "nướng" cho nền sáng (`Badge`, `.exam-blank`, caret `<select>`).
- Chỉ **30** class màu Tailwind cố định (19 file), đa số `text-white` trên nền nhấn → giữ.
- **LC không có dark mode** (`design/*.html` + `globals.css` chỉ có Solarized Light) → lần này không copy được từ LC, bảng màu dark tự dựng, cần người dùng xem lại.
- `(exam)/layout.tsx` không có header nào → dẫn tới câu hỏi C2.

Lưu ý cho Step 1: `SiteHeaderNav` có 3 nhánh trả về (loading / đã đăng nhập / khách) – nút đổi theme phải có ở **cả ba**, không thì khách vào trang chủ không thấy nút.

### Step 1 – Nền tảng theme (2026-09-23)

**Đã làm**

- `globals.css`: 3 khối bảng màu – `:root, :root[data-theme='light']` (trắng, cũng là mặc định của `:root` trần để trang tự dựng `<html>` riêng như `global-error.tsx` vẫn có màu), `:root[data-theme='solarized-light']`, `:root[data-theme='dark']`. Thêm 27 token mới của plan mục 4.3 (`--bg-blur`, `--shadow-1/2/3`, `--accent-shadow`, `--ok/--warn/--info` × `soft/border/text`, `--danger-soft/-border`, `--link`, `--blank-bg`, `--footer-*`, `--overlay`, `--select-caret`). Thêm `:root[data-theme-switching] *` để tắt transition trong lúc đổi theme.
- `src/theme/`: `theme.ts` (hàm thuần + hằng số), `theme-script.ts`, `ThemeProvider.tsx`, `ThemeToggle.tsx`, `index.ts`.
- `app/layout.tsx`: đọc cookie `ls_theme` ở server → `data-theme` trên `<html>` + `suppressHydrationWarning`, nhúng `themeScript` làm phần tử đầu `<body>`, bọc `ThemeProvider`.
- Gắn `ThemeToggle`: `SiteHeaderNav` (**cả 3 nhánh** loading / đã đăng nhập / khách), `DashboardShell`, `UserManualShell`, `SectionIntroScreen`.
- `vi.theme` (label, `names`, `hints`, `current`).

**Bảng màu chọn theo tương phản đo được** (không chọn bằng mắt), ghi kèm trong `globals.css`:

- Nền trắng: `--muted` **không** dùng base1 `#93a1a1` (chỉ 2.7:1) mà dùng `#66787b` (4.6). `--body` `#5f747b` (4.9), `--fg` base00 (5.4), `--accent` magenta giữ nguyên (4.6 trên trắng, tốt hơn 4.2 trên nền kem).
- Nền tối: `--accent` phải sáng lên thành `#ea5c9e` (4.7; magenta gốc chỉ 3.3), `--danger` `#e9635f`, `--muted` `#82969a`; bóng đổ chuyển sang đen đậm (`rgba(0,0,0,.35→.65)`) vì bóng xanh mờ không nhìn ra trên nền tối.
- `solarized-light` giữ **đúng từng giá trị** của bản trước req-4 – đã đối chiếu bằng script với `git show HEAD:…/globals.css`: cả 16 biến cũ khớp tuyệt đối.

**Sai khác so với plan**

- Plan mục 4.4 định viết test jest `no-hardcoded-color.spec.ts`. `apps/lang-app` **chưa có hạ tầng test nào** (không jest config, không script `test`, không file spec – kể cả các hàm thuần sẵn có như `calendar-model.ts`, `curriculum-draft.ts`). Dựng jest cho lang-app là việc ngoài phạm vi req-4 → đổi sang quy tắc ESLint `no-restricted-syntax`, làm ở Step 2. Plan mục 4.4 đã cập nhật.
- Không cần khối `@media (prefers-color-scheme)` trong CSS: `system` do `themeScript` quy về `light`/`dark` trước khi trang được vẽ, nên không phải nhân đôi bảng màu dark trong CSS.
- Bỏ `themeFromCookieHeader` khỏi `theme.ts`: server đọc cookie bằng `cookies()` của Next, client đọc bằng regex trong `themeScript` – hàm này không có ai dùng.

**Đã nghiệm thu**

- `pnpm build && lint && typecheck && test && format:check` pass (348 test lang-api vẫn xanh).
- Chạy `next start` thật, kiểm HTML server render theo cookie: không cookie → `data-theme="light"`; `dark` → `dark`; `solarized-light` → `solarized-light`; cookie rác `hacker` → rơi về `light`; `system` → `light` (script sửa sau). **HTML đầu tiên đã đúng theme nên không nháy màu**, và 3 theme cụ thể đúng cả khi tắt JS.
- Nút đổi giao diện có trong HTML server render của `SiteHeaderNav` nhánh khách (`aria-label="Giao diện: Sáng"`, icon mặt trời), nhãn đổi theo cookie (`dark` → "Giao diện: Tối", `solarized-light` → "Giao diện: Giấy").
- CSS đã build (`0c5676383c1dade2.css`) có đủ 3 bảng màu + 27 token × 3 lần + `background-image:var(--select-caret)`.
- Chạy **đúng chuỗi script được ship** (lấy lại từ HTML server trả về) trong Node với DOM giả, 12 trường hợp: đường đi thường (không ghi cookie lại), `system` theo OS sáng/tối, cookie mất mà localStorage còn (tự dựng lại cookie), giá trị rác `hacker`/`<script>` (rơi về `light`, **không** ghi giá trị lạ vào `data-theme` hay cookie), `localStorage` ném lỗi ở cửa sổ ẩn danh, cookie lẫn nhiều giá trị, và tên cookie gần giống (`other_ls_theme`) không được khớp.

**Chưa nghiệm thu được ở phiên này**

Môi trường không có tool trình duyệt nên **chưa bấm thử** nút đổi theme, chưa xem mắt thường 3 bảng màu. Cần người dùng kiểm: bấm 4 mục ở cả 4 header (khu vực chính, dashboard, `/user-manual`, màn hình giới thiệu section khi thi), F5 xem có giữ lựa chọn, và nhìn tông màu dark có chấp nhận được không.

**Lưu ý cho Step 2**

Sau Step 1 dark mode **đổi được nhưng chưa sạch** – đúng như plan xếp thứ tự. Các chỗ còn màu cứng còn lộ rõ ở dark, ví dụ:

- Header `(site)` và `UserManualShell` vẫn `bg-[rgba(253,246,227,.92)]` → dải kem sáng trên trang tối. Đổi sang `var(--bg-blur)`.
- `Badge` tone `success`/`warning`/`danger`, `SiteFooter`, bóng `shadow-[0_18px_44px_rgba(0,43,54,.08)]` (tàng hình ở dark), `.exam-blank`, `bg-black/5` của `TagMultiSelect`, `bg-[#859900]` trong `SectionIntroScreen`.
- `app/global-error.tsx` tự dựng `<html>` riêng (không có `data-theme`) và dùng hex cố định – nhờ `:root` trần = light nên vẫn ra trang sáng đọc được; cân nhắc giữ nguyên có chủ đích và ghi chú, thay vì cố cho nó theo theme.

### Step 2 – Dọn màu cứng sang token (2026-09-25)

**Đã làm**

- **64 file** đổi màu cứng sang `var(--…)`: 134 lượt thay máy móc theo bảng plan 4.2 (`rgba` bóng đổ/viền/trạng thái, `bg-black/30·40·5`, `rgba(253,246,227,.92·.94)`) + các chỗ phải xử lý riêng (`Badge`, `FormAlert`, `SiteFooter`, `PlanCards`, `SimulatorState`, `ManualBlocks`, `indicator.tsx`, `SectionIntroScreen`, `SectionTabs`, `IssuePanel`, `RegisterForm`, `Brand`, `ExamToolbar`, `TagMultiSelect`, `form-styles`, `ConfirmDialog`, `SpeakingRecorder`).
- `globals.css`: thêm 12 token vào mỗi khối theme + 7 token **không đổi theo theme** khai báo một lần trong `:root` (chi tiết ở plan mục 4.3, có bảng lý do). Thêm phần đầu file mô tả quy ước `--x` / `--x-text` / `--x-soft` / `--x-border` / `--on-status` để Step 3–4 dùng đúng.
- `.exam-blank` → `var(--blank-bg)`, `.exam-editor a` → `var(--link)` (plan D3: chuyển token, không đổi hành vi).
- **ESLint chặn tái phát** (`apps/lang-app/eslint.config.mjs`): `no-restricted-syntax` báo lỗi khi `Literal`/`TemplateElement` chứa `rgba()`/`rgb()`/`hsl()` hoặc hex màu. Quét **mọi chuỗi**, không chỉ `className`, nên bắt được cả `style={{ color: '#fff' }}`. Đã thử: bắt đúng 3 dạng (className, template string, object style), không báo oan `href="/#features"`.
- Danh sách cho phép 5 file (`colorPalettes`): `global-error.tsx` (tự dựng `<html>`, không có `data-theme` – đã ghi comment giải thích), `(site)/page.tsx` + `calendar-model.ts` + `catalog-ui.tsx` + `ExamToolbar.tsx` (bảng màu minh hoạ/màu người dùng chọn, đọc được ở cả 3 theme).

**Sai khác so với plan**

- Plan chỉ liệt kê token ở 4.3; thực tế cần thêm 12 token nữa mới giữ được "giống hệt ở `solarized-light`" (`--danger-bg`, `--on-status`, `--sidebar-hover`, `--accent-hover`, `--cyan`, `--cyan-soft`, `--code-bg`, `--code-fg`, `--footer-muted`, `--footer-divider`, nhóm `--on-accent*`, `--highlight-*`). Đã cập nhật plan mục 4.3.
- Sửa 3 giá trị của Step 1: `--overlay` thành `rgba(0,0,0,.4)` (bằng `bg-black/40` cũ của `Modal`), `--info-text` của `solarized-light` thành `#1f6fa8` (bằng chữ callout cũ), alpha `--ok-soft`/`--warn-soft`/`--info-soft` gom về .12/.12/.10.
- Plan 4.1 định **giữ** `text-white` trên nền nhấn. Vẫn giữ trên `--accent`, nhưng 6 chỗ `text-white` nằm trên **nền màu trạng thái** (`--ok`/`--warn`/`--info`/`--danger`) đổi sang `--on-status`: ở theme tối các màu này sáng lên (để đủ tương phản khi làm chữ) nên chữ trắng trên đó chỉ còn ~2.4:1. Nút nhấn magenta còn `text-white` – soát lại ở Step 3.
- `#2f9e44` (dấu tích "không có lỗi" của `IssuePanel`) đổi sang `--ok` = `#859900`: bỏ một sắc lục lạc khỏi bảng màu, đây là **thay đổi có chủ ý** ở `solarized-light`.

**Đã nghiệm thu**

- `pnpm build && lint && typecheck && test && format:check` pass.
- **Không còn `rgba()`/hex nào** trong `src` ngoài 5 file bảng màu kể trên (quét lại bằng grep).
- Mọi `var(--…)` được dùng đều có khai báo, và **mọi token khai báo đều có nơi dùng** (script đối chiếu 2 chiều) → không có token chết, không có biến gõ sai.
- 3 khối theme có **đúng cùng 52 tên biến** (+7 biến `:root` không đổi theo theme).
- Đối chiếu **từng cặp (màu cũ → token)** bằng script, giải biến theo khối `solarized-light`: 40/70 khớp tuyệt đối, phần còn lại chỉ lệch alpha ≤ .06 trong cùng một màu. Chỗ lệch nhiều hơn, đã cân nhắc và chấp nhận: viền nút banner vượt giới hạn (.45 → .35), nền mờ sidebar mobile (.30 → .40, dùng chung `--overlay` với modal), quầng sáng dưới logo `Brand` (.45 → .28), ring của `FormAlert` lỗi (`#f4d5d0` → `--danger-border`, cùng độ đậm với 3 tone còn lại), hover nút xoá chip (`black/5` → `--hover`).
- CSS đã build có đủ 3 bảng màu; các utility Tailwind dạng `var()` **đều sinh ra CSS** – kiểm từng class trong file css đã build, kể cả loại dễ hỏng: `ring-[var(--ok-border)]` → `--tw-ring-color`, `shadow-[0_18px_44px_var(--shadow-1)]` → `--tw-shadow`, `hover:bg-[var(--sidebar-hover)]`.
- Chạy `next start` thật (cổng 3123): `/`, `/login`, `/register` trả 200 ở cả 4 giá trị cookie (`light`/`solarized-light`/`dark`/rác), HTML server render có `data-theme` đúng và đã dùng `bg-[var(--footer-bg)]`, `bg-[var(--bg-blur)]`. Không lỗi trong log.

**Chưa nghiệm thu được ở phiên này**

Phép thử chính của step ("so bằng mắt từng trang ở `solarized-light`") vẫn cần bạn: môi trường không có tool trình duyệt. Phần đối chiếu giá trị màu đã làm bằng script (ở trên) nên chỉ còn rủi ro ở những chỗ lệch alpha đã liệt kê. Đề nghị bạn mở `solarized-light` và xem nhanh: trang chủ (hero, thẻ gói dịch vụ, footer), một bảng có `Badge`, một `FormAlert` lỗi, modal (độ tối của nền mờ), trình soạn đề (indicator thiếu dạng câu, ô điền, bút dạ quang) và màn hình kết quả (khối giải thích, ô số câu).

**Lưu ý cho Step 3**

- Nền nhạt của 4 màu trạng thái giờ đi qua `--x-soft`, chữ qua `--x-text`, nền đặc qua `--x` + `--on-status`. Soát theme tối thì sửa **giá trị token**, đừng thêm màu vào component.
- Nút nhấn magenta vẫn `bg-[var(--accent)] text-white` (~2.9:1 ở theme tối vì `--accent` đã sáng lên). Cần quyết ở Step 3: hạ `--accent` riêng cho nền, hay cho nút dùng `--on-status`/`--on-accent`.
- `(site)/page.tsx` dùng bảng màu Solarized trang trí (`IconTile`, `STAT_COLORS`) với `${color}22` – ở theme tối nền 13% của các màu này khá mờ, xem lại khi rà trang chủ.
- Máy có một tiến trình `next start` lạ đang giữ cổng 3100 (không phải của phiên này) – dùng cổng khác khi chạy thử.
