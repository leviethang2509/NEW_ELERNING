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
| 2 | Dọn màu cứng sang token (~70 `rgba` + hex, 33 file) + ESLint chặn tái phát | ⬜ | | |
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
