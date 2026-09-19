# Requirement 3 – Tiến độ

> **Phiên chat mới:** đọc [CLAUDE.md](../../CLAUDE.md) → file này → phần liên quan của [req-3-plan.md](req-3-plan.md).
> Sau mỗi step: cập nhật bảng trạng thái + thêm mục nhật ký bên dưới.
>
> Trạng thái: ✅ Xong · 🟡 Đang làm · ⬜ Chưa làm · ⛔ Bị chặn

## Bảng trạng thái

| Giai đoạn | Step | Nội dung | Trạng thái | Ngày xong | Ghi chú |
|---|---|---|---|---|---|
| 0 | – | Câu hỏi 4 vòng, plan, DB local `lang_simulator_dev` | ✅ | 2026-09-19 | Seed System Owner xong; CLAUDE.md cập nhật DB local |
| 1 | 1 | Đổi tên danh mục | 🟡 | | Code + nghiệm thu local xong; chờ commit/push để deploy :3001 |
| 1 | 2 | Mẫu bài học | ⬜ | | |
| 1 | 3 | Editor: khối mới & giải thích | ⬜ | | |
| 1 | 4 | Soạn bài học | ⬜ | | |
| 1 | 5 | Học bài học & chấm tay bài học | ⬜ | | Deploy giai đoạn 1 |
| 2 | 6 | Khoá học & giáo trình tham khảo | ⬜ | | |
| 2 | 7 | Lớp học & giáo trình lớp | ⬜ | | |
| 2 | 8 | Thời khoá biểu, ngày nghỉ, lịch | ⬜ | | |
| 2 | 9 | Học viên trong lớp | ⬜ | | |
| 2 | 10 | Chấm theo lớp & chuyển giao | ⬜ | | Deploy giai đoạn 2 |
| 3 | 11 | Chuyên cần, bảng điểm, nhận xét cuối khoá | ⬜ | | |
| 3 | 12 | Thông báo | ⬜ | | |
| 3 | 13 | Phụ huynh | ⬜ | | |
| 3 | 14 | Hoàn thiện & nghiệm thu tổng | ⬜ | | Deploy giai đoạn 3 |

## Bàn giao cho phiên tiếp theo

- Step 1 xong phần code, chờ người dùng commit/push (deploy :3001, migration chạy lúc container khởi động) rồi kiểm trang Danh mục/Loại đề/Đề thi trên :3001 → đánh ✅. Step 2 chỉ bắt đầu sau khi deploy (P2).
- Máy dev: `apps/lang-api/.env` trỏ Postgres local `lang_simulator_dev` (cấu hình VPS để comment `# VPS:`). DB local có 10 migration + 1 System Owner, chưa có tenant. Còn schema rỗng `lang_simulator` sót lại (không ảnh hưởng).
- Thay đổi chưa commit: toàn bộ Step 1 + `CLAUDE.md`, `README.md`, `req-1-plan.md` (mục Database), các file `req-3*.md`.

## Nhật ký

### Step 1 – Đổi tên danh mục (2026-09-19)

**Đã làm**
- Migration viết tay `1789797313218-RenameExamCategoriesToCategories`: `ALTER TABLE … RENAME` + đổi tên PK, 3 CHECK, 3 FK, 2 unique index (`*_exam_categories_*` → `*_categories_*`); `down` đổi ngược. FK `FK_exam_blueprints_category_id` giữ tên (thuộc bảng `exam_blueprints`), tự trỏ bảng mới. (`migration:generate` coi đổi tên là xoá + tạo nên không dùng.)
- lang-api: thư mục `exam-catalog/` → `catalog/` (`CatalogModule`), `Category` entity (`category.entity.ts`), `CategoriesService`, `Create/UpdateCategoryDto`, `toCategoryItem/Ref`; route `admin/categories`, `t/:slug/categories`; bảng `ROUTES` cập nhật. Message "danh mục đề" → "danh mục".
- `@lang/shared`: `exam-catalog.ts` → `catalog.ts`; `CategoryItem`, `CategoryRef`, `CategoryColor`, `CategoryIconName` (không dùng `CategoryIcon` vì trùng component lang-app), `DEFAULT_CATEGORY_*`, `CATALOG_CODE_PATTERN`/`CATALOG_*_MAX_LENGTH`.
- lang-app: `components/exam-catalog` → `components/catalog`, `CategoriesView`; trang `/admin/categories`, `/t/{slug}/dashboard/categories`; `vi.examCatalog` → `vi.catalog`, menu "Danh mục" (`vi.nav.categories`).
- Tài liệu: `/user-manual` (tên menu, đường dẫn, thuật ngữ; `updatedAt` 2026-09-19), README, CLAUDE.md.

**Sai khác so với plan**
- Đổi tên thêm thư mục/module `exam-catalog` → `catalog` (API và lang-app) vì Step 2 đặt mẫu bài học cùng chỗ. Loại đề giữ tên `ExamBlueprint*` / `exam-blueprints`.
- Không thêm redirect từ URL cũ `/…/exam-categories` (chưa có production; URL cũ trả 404).

**Nghiệm thu (local)**
- 5 lệnh kiểm tra pass (lang-api 190 test).
- Migration: chạy → `migration:generate` báo "No changes" → revert → chạy lại OK; dữ liệu seed (EN, JA) giữ nguyên, FK loại đề trỏ `categories`.
- API thật (:3101): route cũ 404; CRUD danh mục hệ thống; xoá danh mục có loại đề → 409; tenant thử: danh mục riêng + hệ thống, loại đề riêng, tạo đề, lọc đề theo danh mục, xem đề. Đã xoá tenant thử.
- lang-app (`next start`): `/admin/categories`, `/t/{slug}/dashboard/categories` 200, URL cũ 404, proxy `/api` hoạt động. Chưa bấm giao diện bằng trình duyệt (nội dung render phía client) – nên mở thử 2 trang Danh mục khi kiểm :3001.

**Lưu ý cho step sau**
- `CategoryItem.blueprintCount` hiện chỉ đếm loại đề; Step 2 thêm số mẫu bài học và chặn xoá danh mục có mẫu bài học.
- Chuỗi `vi.catalog.categories.subtitle` còn nói "nhóm loại đề"; Step 2 sửa thành loại đề + mẫu bài học.
