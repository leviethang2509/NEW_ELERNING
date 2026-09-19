# Requirement 3 – Tiến độ

> **Phiên chat mới:** đọc [CLAUDE.md](../../CLAUDE.md) → file này → phần liên quan của [req-3-plan.md](req-3-plan.md).
> Sau mỗi step: cập nhật bảng trạng thái + thêm mục nhật ký bên dưới.
>
> Trạng thái: ✅ Xong · 🟡 Đang làm · ⬜ Chưa làm · ⛔ Bị chặn

## Bảng trạng thái

| Giai đoạn | Step | Nội dung | Trạng thái | Ngày xong | Ghi chú |
|---|---|---|---|---|---|
| 0 | – | Câu hỏi 4 vòng, plan, DB local `lang_simulator_dev` | ✅ | 2026-09-19 | Seed System Owner xong; CLAUDE.md cập nhật DB local |
| 1 | 1 | Đổi tên danh mục | ✅ | 2026-09-19 | Commit 484f81e, deploy :3001, người dùng kiểm OK |
| 1 | 2 | Mẫu bài học | ✅ | 2026-09-19 | Chưa commit |
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

- Step 2 xong (chưa commit). Tiếp theo: Step 3 – Editor: khối mới & giải thích.
- Máy dev: `apps/lang-api/.env` trỏ Postgres local `lang_simulator_dev` (cấu hình VPS để comment `# VPS:`). DB local có 11 migration, 1 System Owner, chưa có tenant; có sẵn mẫu bài học hệ thống **Minna no Nihongo – 1 bài** (`MINNA-1-BAI`, 5 phần, danh mục JA) tạo lúc nghiệm thu, giữ lại để dùng ở Step 4. Còn schema rỗng `lang_simulator` sót lại (không ảnh hưởng).
- Chạy thử: API `node dist/main.js` (:3101), app `pnpm start` (:3100). Dừng Next bằng `pkill -f next-server` (tiến trình tên `next-server`, `pkill -f "next start"` không bắt được).

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

### Step 2 – Mẫu bài học (2026-09-19)

**Đã làm**
- Migration `1789798273850-CreateLessonBlueprints` (sinh bằng `migration:generate`, `down` rút gọn): `lesson_blueprints` (như `exam_blueprints`, FK `categories` RESTRICT) + `lesson_modules` (không có thời lượng, unique mã deferred).
- lang-api (`catalog/`): `LessonBlueprint`, `LessonModule`, `LessonBlueprintsService` (chép `ExamBlueprintsService`: phạm vi hệ thống/tenant, danh mục phải thấy được & đang dùng, mã unique theo phạm vi, lưu cả danh sách phần), DTO, `AdminLessonBlueprintsController` (`admin/lesson-blueprints`), `TenantLessonBlueprintsController` (`t/:slug/lesson-blueprints`: xem Owner/Admin/Teacher, sửa Owner/Admin); `ROUTES` thêm 8 dòng. Unit test service + DTO.
- `CategoriesService`: đếm và chặn xoá theo cả loại đề lẫn mẫu bài học; `CategoryItem.blueprintCount` → `examBlueprintCount` + `lessonBlueprintCount`.
- `@lang/shared`: `LessonBlueprintItem`, `LessonModuleItem`, `LessonModuleInput`, `LESSON_BLUEPRINT_MIN/MAX_MODULES`.
- lang-app: `LessonBlueprintsView` + `LessonBlueprintFormModal` (chép bản loại đề), `ModulesEditor` thêm `variant="lesson"` (bỏ ô thời lượng, chữ "phần"); trang `/admin/lesson-blueprints`, `/t/{slug}/dashboard/lesson-blueprints`; menu "Mẫu bài học"; nhóm menu đổi tên **Đề thi & Bài học** (plan 6.1); trang Danh mục có 2 cột Loại đề / Mẫu bài học.
- Tài liệu: `/user-manual` (trang danh mục hệ thống + trung tâm, thuật ngữ, vai trò, giới hạn, tên nhóm menu), README, CLAUDE.md.

**Sai khác so với plan**
- Không tạo `LessonCatalogModule` riêng: mẫu bài học nằm trong `CatalogModule` (`catalog/`, đã đổi tên ở Step 1) cạnh loại đề; service/entity/controller vẫn tách riêng.
- `ModulesEditor` dùng chung (thêm `variant`) thay vì chép, vì chỉ khác ô thời lượng.
- Chưa có cột "Số bài học" và chưa chặn nút xoá mẫu đang dùng: bảng `lessons` có ở Step 4. `remove` đã bắt lỗi khoá ngoại → 409 "Mẫu bài học đang có bài học sử dụng…".

**Nghiệm thu (local)**
- 5 lệnh kiểm tra pass (lang-api 198 test).
- Migration: chạy → "No changes" → revert → chạy lại OK.
- API thật (:3101): System Owner tạo **Minna no Nihongo – 1 bài** (5 phần, thứ tự đúng); mã trùng 409, không có phần 400; danh mục JA đếm 1 loại đề + 1 mẫu, xoá JA → 409. Tenant thử: thấy mẫu hệ thống, sửa mẫu hệ thống 403, tạo mẫu riêng (trùng mã hệ thống được), sửa danh sách phần giữ id phần cũ. Teacher: xem được cả 2 mẫu, tạo/sửa/xoá 403. Đã xoá tenant + giáo viên thử.
- lang-app (`next start`): 2 trang mẫu bài học 200. Chưa bấm giao diện bằng trình duyệt.

**Lưu ý cho step sau**
- Step 4: thêm `LessonBlueprintsService.findUsable` (như loại đề), cột "Số bài học" (`lessonCount`) và khoá nút xoá mẫu đang dùng; FK `lessons.blueprint_id` NO ACTION.
