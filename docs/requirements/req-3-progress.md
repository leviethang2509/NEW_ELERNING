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
| 1 | 2 | Mẫu bài học | ✅ | 2026-09-19 | Commit 38d6470 |
| 1 | 3 | Editor: khối mới & giải thích | ✅ | 2026-09-19 | Commit ce4dc75 (dữ liệu thử `step3-test` còn giữ) |
| 1 | 4 | Soạn bài học | ✅ | 2026-09-19 | Commit ce4dc75 (dữ liệu thử `step4-test` còn giữ) |
| 1 | 5 | Học bài học & chấm tay bài học | ✅ | 2026-09-19 | Commit db18cb7, đã push `main` (deploy giai đoạn 1) |
| 2 | 6 | Khoá học & giáo trình tham khảo | ✅ | 2026-09-19 | Chưa commit; chờ người dùng bấm thử giao diện (dữ liệu thử ở `step4-test`) |
| 2 | 7 | Lớp học & giáo trình lớp | ⬜ | | |
| 2 | 8 | Thời khoá biểu, ngày nghỉ, lịch | ⬜ | | |
| 2 | 9 | Học viên trong lớp | ⬜ | | |
| 2 | 10 | Chấm theo lớp & chuyển giao | ⬜ | | Deploy giai đoạn 2 |
| 3 | 11 | Chuyên cần, bảng điểm, nhận xét cuối khoá | ⬜ | | |
| 3 | 12 | Thông báo | ⬜ | | |
| 3 | 13 | Phụ huynh | ⬜ | | |
| 3 | 14 | Hoàn thiện & nghiệm thu tổng | ⬜ | | Deploy giai đoạn 3 |

## Bàn giao cho phiên tiếp theo

- Giai đoạn 1 (Step 1–5) xong, đã push `main` (`db18cb7`). Giai đoạn 2: Step 6 xong trên local, **chưa commit** (deploy cùng cả giai đoạn 2 sau Step 10; migration `CreateCoursesCurricula` chạy lúc container khởi động; không có env mới).
- **Tiếp theo: Step 7 – Lớp học & giáo trình lớp** (plan mục 7, DB mục 4.5, phân quyền mục 5, route mục 6). Xem "Lưu ý cho step sau" của Step 5, Step 6 và prompt ở cuối file.
- Máy dev: `apps/lang-api/.env` trỏ Postgres local `lang_simulator_dev`. DB local có 15 migration, 1 System Owner, mẫu bài học hệ thống **Minna no Nihongo – 1 bài**. **Còn giữ dữ liệu thử** để người dùng bấm giao diện:
  - Step 3: tenant `step3-test` (4 đề, 1 lượt làm chờ chấm) + `step3-teacher|student|student2@example.com`.
  - Step 4–5: tenant `step4-test` (System Owner là Chủ sở hữu). Bài **Minna bài 1** của `step4-teacher` (công khai, **version 2**; tab Từ vựng có furigana/callout/khối gập mở, tab Luyện tập có Writing + Speaking, tab Bài tập 2 câu MC + 1 giải thích) và bản sao nháp **Bản của GV2** của `step4-teacher2`. `step4-student@example.com` có 2 lượt học: version 1 (đã học xong, chỉ xem lại, phần Luyện tập vừa nộp lại → **chờ chấm** ở trang Chấm bài → Bài học) và version 2 (mới mở, chưa làm gì).
  - Step 6 (cũng ở `step4-test`): khoá **Tiếng Nhật N5** (`N5`, 24 buổi) và **Tiếng Nhật N5 – lớp tối** (`N5-TOI`), cả hai gắn giáo trình **Giáo trình N5 – Minna no Nihongo** của `step4-teacher` (3 chương, 7 mục: Minna bài 1–4, Kiểm tra chương 1–2, Thi cuối khoá N5); bản sao **… (bản sao)** của `step4-teacher2` (rút còn 1 mục). Bài Minna bài 2–4 và 3 đề JLPT_N2 (hiển thị Chỉ qua lớp) do `step4-teacher` tạo cho giáo trình.
  - Dọn dẹp (đã thử trong transaction, chạy được với bảng lượt học): `delete from tenants where slug in ('step3-test','step4-test'); delete from users where email like 'step3-%@example.com' or email like 'step4-%@example.com';`. File ghi âm thử nằm trên bucket R2 private (prefix `tenants/{id tenant step4-test}/lesson-attempts/`), xoá DB không xoá file. Còn schema rỗng `lang_simulator` sót lại (không ảnh hưởng).
- Chạy thử: API `node dist/main.js` (:3101, sau `pnpm build`), app `pnpm start` (:3100); **đang chạy** bản build Step 6 (log ở scratchpad phiên Step 6). Dừng Next bằng `pkill -f next-server`; trước khi chạy API mới kiểm `lsof -iTCP:3101 -sTCP:LISTEN`. Kiểm trang qua curl cần cookie `ls_rt=x`. Nghiệm thu API không cần mật khẩu: ký JWT `{ sub, tv }` bằng `JWT_SECRET` trong `.env` (mẫu: `accept6.js` trong scratchpad phiên Step 6 – `tokenOf(email)` đọc `token_version` từ DB; Chủ sở hữu `step4-test` là `admin@lang-simulator.com`). Không có công cụ trình duyệt – nhờ người dùng bấm thử; kiểm render không cần trình duyệt: bundle bằng esbuild (`node_modules/.pnpm/esbuild@*/node_modules/esbuild/bin/esbuild --bundle --platform=node --jsx=automatic --packages=external --alias:@=./src`, chạy trong `apps/lang-app`) rồi `renderToStaticMarkup`, chạy với `NODE_PATH=apps/lang-app/node_modules` (component có `Modal`/portal không render được kiểu này).

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

### Step 3 – Editor: khối mới & giải thích (2026-09-19)

**Đã làm**
- `@lang/exam-core`:
  - `IndicatorKind` thêm `explanation` (nhãn "Explanation"). `explanation.ts`: `extractExplanations`/`explanationsFromPlan` → `SectionExplanation { nodeId, numbers, blocks }`, `explanationsFor`, `isExplanation`. Quy tắc gắn (người dùng chốt đầu phiên): đi ngược lên, bỏ qua explanation khác; gặp question thì lấy mọi số câu của nó, gặp part/subpart hoặc hết thì `numbers: []`.
  - `stripAnswers` bỏ nội dung giải thích, giữ indicator rỗng. `validateSection`: giải thích rỗng → cảnh báo. `buildOutline`: dòng "Explanation · câu 3–7 / không gắn câu hỏi nào". `migrateExamValue` giữ `explanation` (trước đây kind lạ bị đổi thành `question`).
  - `rich.ts`: `callout`/`toggle`/`ruby` + `blockDepth`/`toggleEnd`.
  - Test: `explanation.spec.ts`, `rich.spec.ts`; test đối chiếu LC chạy thêm bản có giải thích chèn sau mọi câu (nội dung giải thích cố tình có checkbox tick, blank, cặp ghép) → đánh số, `exam_questions`, kết quả chấm y hệt.
- lang-app:
  - Plugin `plate/exam/rich-blocks.tsx`: `CalloutPlugin` (Enter xuống dòng, Enter ở dòng trống cuối thì thoát; chọn loại ngay trên khối), `TogglePlugin` (Enter cuối tiêu đề tạo dòng thụt vào), `RubyPlugin` (inline).
  - Toolbar: dropdown Callout, nút Khối gập/mở, nút Furigana (`PromptDialog`). Slash menu: 3 callout + khối gập/mở (H1–H3 đã có). `ExplanationDialog`: hướng dẫn chi tiết + "sẽ gắn với câu …" theo vị trí con trỏ.
  - `ExamSimulator`/`ExamBlocks` render ruby, callout, `<details>` cho khối gập/mở (trong câu hỏi dừng trước nhóm lựa chọn/cặp ghép/dòng đánh số). Giải thích: `ExplanationReveal` chỉ hiện khi đã có `result` (xem trước sau khi Nộp).
  - `ExamFormModal` có ô **Hiển thị** (tạo + sửa). Danh sách đề: nhãn "Chỉ qua lớp", dòng "Bản sao của …", nút **Nhân bản** (có xác nhận, xong mở trình soạn bản sao). Trang chấm: khối "Giải thích (học viên không thấy)".
- lang-api:
  - Migration `1789799812859-ExamVisibilityCloneExplanations`: `exams.visibility` (varchar + `CHK_exams_visibility`, mặc định `tenant`), `exams.cloned_from_id` (FK tự trỏ, SET NULL), `exam_sections.explanations jsonb NOT NULL DEFAULT '[]'`.
  - `prepareSection` ghi `explanations`; helper `insertPreparedSections` dùng chung cho tạo đề, lưu nội dung, nhân bản.
  - `POST t/:slug/exams/:id/clone` (thêm vào `ROUTES`). PATCH/POST đề nhận `visibility`. `ExamListItem` thêm `visibility`, `clonedFrom`.
  - Học viên: danh sách + bộ lọc chỉ đề `tenant`; bắt đầu lượt làm đề `private` → 404; trang đề `private` → 404 nếu chưa từng làm, đã làm thì xem lịch sử (`isOpen = false`).
  - Chấm: `GradingQuestion.explanations`. `sectionPrompts` bỏ qua segment giải thích (nếu không, hướng dẫn subpart của câu đứng sau giải thích bị mất).
- Tài liệu: `/user-manual` (Vòng đời đề thi: Hiển thị, Nhân bản; Trình soạn đề: Explanation, khối trình bày, lỗi mới; Làm bài thi; Chấm bài; thuật ngữ; ma trận quyền; vai trò), CLAUDE.md.

**Sai khác so với plan**
- `exam_sections.explanations` là `NOT NULL DEFAULT '[]'` thay vì NULL (section cũ không có giải thích nên `[]` là đúng). Default entity phải viết `() => "'[]'"`: viết `'[]'::jsonb` thì `migration:generate` luôn báo lệch.
- Heading H1–H6 và highlight **đã có sẵn** từ bản chép LC (loại đoạn + nút Đánh dấu, H1–H3 trong slash menu). Step này chỉ thêm callout, khối gập/mở, furigana.
- Khối gập/mở là block phẳng (tiêu đề + các block thụt sâu hơn), không phải block chứa block con, để mọi logic câu hỏi của exam-core giữ nguyên. Trong editor luôn mở (có mũi tên và tooltip hướng dẫn). Chỉ simulator/`ExamBlocks` gập, mặc định đóng.
- Nhân bản (người dùng chốt đầu phiên): đề đã publish của bất kỳ ai **hoặc** đề mình sửa được (nháp/lưu trữ). Bản sao giữ `visibility` của đề gốc, `created_by` = người nhân bản, không kiểm loại đề còn dùng được không.
- Tạo đề cũng nhận `visibility` (plan chỉ ghi PATCH).

**Nghiệm thu (local)**
- 5 lệnh kiểm tra pass (exam-core 63, shared 61, lang-api 204 test).
- Migration: chạy → "No changes" (lần đầu lệch default jsonb → revert, sửa entity, sinh lại).
- API thật (:3101), script `accept3.js` 33 mục đều đạt. Tenant thử, đề có furigana/callout/khối gập mở/2 giải thích:
  - `exam_sections.explanations` gắn câu 1 và 2. Nội dung giải thích **không có** trong content_public và mọi response phía học viên (danh sách, bắt đầu lượt, start section, nộp, kết quả, chi tiết lượt, trang đề).
  - Người chấm nhận đúng giải thích của câu Writing.
  - Teacher đổi hiển thị đề người khác 403; giá trị lạ 400. Đề `private` biến khỏi danh sách; học viên chưa làm mở đề/bắt đầu lượt → 404; học viên đã làm vẫn xem lịch sử và kết quả.
  - Teacher nhân bản đề đã publish → nháp của Teacher, version 1, cùng nội dung (kể cả giải thích), không có bài làm. Teacher nhân bản nháp người khác 403; Student 403.
- Render `ExamSimulator`/`ExamBlocks` bằng `react-dom/server`: ruby, callout, `<details>`, khối gập trong câu hỏi không nuốt lựa chọn, giải thích ẩn khi chưa nộp. **Chưa bấm giao diện bằng trình duyệt** (editor: toolbar, slash, Enter trong callout/khối gập, furigana, hộp Explanation; xem trước hiện giải thích sau Nộp; form Hiển thị; nút Nhân bản; trang chấm) – dữ liệu thử `step3-test` còn giữ, xem phần bàn giao.

**Lưu ý cho step sau**
- Bài học dùng lại `extractExplanations`/`explanationsFor`, `ContentVisibility`, `CLONE_TITLE_SUFFIX`, và cách tạo bản sao (chạy lại `prepareSection` trên `raw_data` của version hiện tại).
- Step 5 (học bài) hiện giải thích sau khi nộp section: lấy từ `lesson_sections.explanations` của server, **không** gửi trước khi nộp.
- Step 9: làm đề `private` qua lớp phải đi đường riêng (`class_item_id`), không nới điều kiện `visibility` ở `AttemptsService.create` hiện tại.

### Step 4 – Soạn bài học (2026-09-19)

**Đã làm**
- Người dùng chốt đầu phiên: (1) chưa có `lesson_attempts` thì mọi lần lưu ghi đè version hiện tại, Step 5 bổ sung; (2) xem trước tạm dùng `ExamSimulator`. Plan Step 4/5 đã ghi lại.
- Migration `1789827136380-CreateLessons` (sinh bằng `migration:generate`, `down` rút gọn): `lessons` (FK `lesson_blueprints` NO ACTION, `visibility` mặc định `private`, `cloned_from_id` SET NULL, xoá mềm), `lesson_sections` (không có `duration_minutes`, `explanations jsonb NOT NULL DEFAULT '[]'`), `lesson_parts`, `lesson_questions`.
- lang-api `lessons/`: `LessonsService` (list/creators/create/detail/update + hiển thị/clone/publish/archive/remove), `LessonContentService` (save/versions/getVersion/restore), `lesson-section-content.ts`, mapper (`canEditLesson`), DTO, `LessonsController` (`t/:slug/lessons`, `EXAM_AUTHOR_ROLES`), `LessonAttemptLookup` (chỗ nối lượt học của Step 5). `ROUTES` thêm 13 dòng. Unit test `lesson-content.service.spec.ts` (19 test: tạo từ mẫu, version/khôi phục khi có lượt học, 409/400, giải thích, quyền Teacher/Owner/Admin, tenant khác 404, hiển thị, nhân bản, publish 422, xoá hẳn/xoá mềm, DTO).
- Mẫu bài học: `LessonBlueprintsService.findUsable`, `LessonBlueprintItem.lessonCount` (đếm cả bài xoá mềm; trang hệ thống đếm mọi tenant). lang-app: cột **Số bài học**, nút xoá khoá khi mẫu đang dùng.
- `@lang/shared`: `lesson-content.ts` (`LessonListItem`, `LessonDetail`, `LessonSectionItem`, input/version types, giới hạn `LESSON_*`; `LessonStatus`/`LessonSectionStatus` là alias enum đề thi).
- `@lang/exam-core`: `validateSection(value, { requireQuestions })`; bài học tắt cảnh báo "Section chưa có câu hỏi nào." (API `sectionIssues(…, LESSON_VALIDATE_OPTIONS)`, editor `validateOptions`).
- lang-app: `lib/lesson-api.ts`; `components/lesson-editor` (`LessonEditor`, `lesson-sections.ts`, `lesson-draft.ts`); `components/lessons/LessonFormModal`; trang `/t/{slug}/dashboard/lessons`, `lessons/[id]/edit`, `lessons/[id]/versions`; menu **Bài học** (nhóm Đề thi & Bài học). Component dùng chung của trình soạn đề thêm tuỳ chọn: `SectionTabs` (`variant="lesson"`, `onDuration` tuỳ chọn), `SectionEditor` (`validateOptions`), `PreviewDialog` (`durationMinutes` tuỳ chọn, `aside`).
- Tài liệu: `/user-manual` nhóm **Đề thi & Bài học** thêm trang **Bài học**; thuật ngữ, ma trận quyền, menu theo vai trò, vai trò Chủ sở hữu/Quản trị viên/Giáo viên, mẫu bài học (Số bài học, chặn xoá), giới hạn, ngoài phạm vi. CLAUDE.md (bài học API/app, `requireQuestions`, lệnh migrate).

**Sai khác so với plan**
- Không chép nguyên `ExamEditor` cùng mọi file con: `LessonEditor`, form, trang, bản nháp là bản riêng; `SectionEditor`/toolbar/dialog/`SectionTabs`/`PreviewDialog` dùng chung (thêm prop) vì chỉ khác thời lượng. Kiểm tra nội dung dùng lại `assertSectionShapes`/`sectionIssues` của đề thi (thuần `@lang/exam-core`).
- Thêm `requireQuestions` cho `validateSection` (plan không ghi): section lý thuyết của bài học luôn bị cảnh báo thừa nếu không tắt.
- Chưa có lượt học nên version bài học luôn là 1 (xem quyết định đầu phiên).

**Nghiệm thu (local)**
- 5 lệnh kiểm tra pass (shared 61, exam-core 63, lang-api 225 test).
- Migration: chạy → "No changes" → revert → chạy lại OK. ⚠️ Lần đầu gọi nhầm `migration:revert` khi CreateLessons chưa chạy (không có script `migration:run`) → revert mất migration Step 3; đã chạy lại, khôi phục `visibility`/`cloned_from_id` của 4 đề `step3-test` theo `accept3.js` và tính lại `exam_sections.explanations` từ `raw_data` (đề Step 3 + bản sao: 2 giải thích mỗi đề, như trước). CLAUDE.md đã ghi lệnh đúng.
- API thật (:3101), script `accept4.js` 41 mục đều đạt: Teacher tạo bài từ Minna → 5 tab đúng thứ tự, nháp/private/không thời lượng; lưu nháp còn lỗi được, publish → 422 kèm issues (không cảnh báo section lý thuyết); `baseRevision` cũ 409; publish; `lesson_sections.explanations` gắn câu 1, content_public không có giải thích/đáp án; furigana/callout/khối gập mở đọc lại nguyên vẹn. Teacher khác: xem được (`canEdit=false`), lưu/sửa/lưu trữ/xoá/khôi phục 403, **nhân bản** → nháp của mình (nội dung + giải thích), sửa bản sao được; nhân bản nháp người khác 403; Student 403. Owner đổi hiển thị bài của Teacher (không đổi version), giá trị lạ 400, lưu trữ; Teacher publish lại. Danh sách không kèm nội dung; trang version 1 version. `lessonCount` Minna = 2; mẫu riêng đang có bài → xoá 409, ngừng dùng → tạo bài 400, hết bài thì xoá được.
- lang-app (`next start`, cookie `ls_rt`): `/t/step4-test/dashboard/lessons`, `…/edit`, `…/versions`, 2 trang mẫu bài học, trang đề thi đều 200. Render `SectionTabs` bản bài học (không ô/nhãn thời lượng) và `LessonFormModal` bằng `react-dom/server`. **Chưa bấm giao diện bằng trình duyệt**: danh sách (lọc, Nhân bản, Publish, Lưu trữ, Xoá), form tạo (Hiển thị mặc định Chỉ qua lớp), trình soạn (5 tab không thời lượng, thêm section từ phần của mẫu, lưu, bản nháp, Chỉ xem với Teacher khác), xem trước (Nộp → giải thích), trang Version, cột Số bài học ở trang Mẫu bài học.

**Lưu ý cho step sau**
- Step 5: nối `LessonAttemptLookup` vào `lesson_attempts`; giữ nguyên chữ ký để `LessonsService`/`LessonContentService` không phải đổi.
- `ExamStatusBadge` dùng cho cả bài học (cùng giá trị trạng thái).
- Nội dung bài học trả cho học viên phải là `content_public` (không phải `raw_data`); giải thích chỉ sau khi nộp section.

### Step 5 – Học bài học & chấm tay bài học (2026-09-19)

**Đã làm**
- Người dùng chốt đầu phiên (ghi vào plan Step 5): "học xong" **tự động**, không có nút bấm tay; sau "Làm lại" vẫn mở được **Xem kết quả lần trước**; bài có version mới thì lượt version cũ **chỉ xem lại**.
- Migration `1789828790860-CreateLessonAttempts` (sinh bằng `migration:generate`, `down` rút gọn): `lesson_attempts` (2 index unique một phần theo `class_item_id`, FK `lessons` NO ACTION), `lesson_attempt_sections` (FK `lesson_sections` NO ACTION), `lesson_attempt_answers` (unique `(attempt_section_id, question_id)`, FK `lesson_questions` NO ACTION).
- lang-api `lesson-attempts/`: `LessonAttemptsService` (mở lượt/dùng lại lượt của version hiện tại, mở tab, autosave, nộp → chấm + đáp án + giải thích, làm lại, ghi âm bản đang làm, nghe lại bản đang làm/đã nộp), `LearnerLessonsService` (danh sách `tenant` + bộ lọc, trang bài học + các lượt học), `LearnerLessonsController`. `LessonAttemptLookup` đọc `lesson_attempts` (Save có lượt học → version mới, xoá → xoá mềm, trang Version có số lượt học). `gradeSection` của `attempts/attempt-grading.ts` nhận kiểu `QuestionRow` để dùng chung.
- Chấm bài học: `LessonGradingService` + `LessonGradingController` (`grading/lesson-attempts`, `…/:id`, `…/:id/recordings/:answerId/url`, `grading/lesson-answers/:answerId`), cùng quyền đề thi (`GRADER_ROLES`, không chấm bài mình). `ROUTES` thêm 15 dòng. Repository giả hỗ trợ thêm `MoreThan`.
- `@lang/shared`: `lesson-attempt.ts` (`LessonAttemptStatus`, `LessonAttemptSectionStatus`, `LearnerLesson*`, `LessonAttemptView`, `LessonSectionResult`, `LessonGrading*`…).
- lang-app:
  - `SimulatorProvider` thêm `review` (kết quả + đáp án + giải thích theo id indicator + điểm chấm tay) và `flags`. `ExamSimulator`: lựa chọn đúng có nhãn **Đáp án đúng**, ô trống/cặp ghép sai hiện đáp án, sắp xếp sai hiện **Thứ tự đúng**, điểm/nhận xét câu chấm tay, giải thích lấy từ `review` khi content_public chỉ còn indicator. `ExamDocument` = nội dung liền mạch (không tab Part). `renderPlan` tách ra dùng chung.
  - `components/lesson-viewer`: `LessonViewer` (tab section có dấu ✓, "Nộp phần này" hỏi lại khi còn câu chưa làm, "Làm lại", "Xem kết quả lần trước"/"Quay lại làm bài"), `lesson-review.ts`, `LessonPreviewDialog` (thay `PreviewDialog` ở trình soạn bài học và trang Version).
  - `components/lesson-learning`: `LearnerLessonList` (mục **Bài học** ở `/t/{slug}`), `LearnerLessonDetailView` (`/t/{slug}/lessons/{id}`), `LessonAttemptScreen` (`/t/{slug}/lesson-attempts/{id}`, autosave 2 giây/khi đổi tab/ẩn trang, trạng thái lưu), `SubmittedRecording`. Middleware chặn thêm `/t/:slug/lessons`, `/t/:slug/lesson-attempts`.
  - `SpeakingRecorder` nhận `upload`/`getUrl` (trang thi đề truyền hàm cũ).
  - Trang Chấm bài: bộ chọn **Đề thi | Bài học** (`?kind=lesson`), trang `/grading/lessons/{attemptId}`; `GradingAttemptView` nhận `kind` (tiêu đề giải thích "học viên thấy sau khi nộp" với bài học).
- Tài liệu: `/user-manual` nhóm **Học, thi & chấm bài** thêm trang **Học bài học**; sửa trang Bài học (xem trước, hiển thị, version, xoá), Chấm bài (Đề thi | Bài học, nộp lại bỏ điểm cũ), thuật ngữ **Lượt học**, ma trận quyền (học bài học công khai: mọi vai trò), vai trò Học viên. CLAUDE.md (lesson-attempts, chấm bài học, lang-app học bài).

**Sai khác so với plan**
- Module riêng `lesson-attempts/` (không nằm trong `lessons/`); entity lượt học đăng ký thêm ở `LessonsModule` cho `LessonAttemptLookup` (tránh import vòng).
- Thêm cột so với plan 4.3: `lesson_attempts` có `submitted_at`, `graded_at`, `auto_correct/auto_total`, `manual_count/manual_graded_count` (tổng lần nộp gần nhất, để lọc/sắp xếp trang Chấm bài); `lesson_attempt_sections` có `status` (open/submitted), `responses` = bản đang làm, `submitted_responses` = lần nộp gần nhất, `recordings` jsonb = ghi âm bản đang làm (answers bị xoá/tạo lại mỗi lần nộp nên không giữ ghi âm nháp ở đó), `order_seed`.
- `class_item_id` chưa có khoá ngoại (bảng `class_items` có ở Step 7).
- Danh sách chấm bài học là endpoint riêng `GET grading/lesson-attempts` (plan ghi `attempts?kind=`) vì dữ liệu khác loại; route thêm: `POST …/sections/:sid/retry`, `GET …/sections/:sid/recordings/:number/url`, `GET …/answers/:answerId/recording-url`, `GET grading/lesson-attempts/:id/recordings/:answerId/url`.
- `POST lessons/:id/attempts` trả lượt đã có của version hiện tại (200) thay vì 409 như đề thi.
- `gradeSection` dùng chung với đề thi thay vì chép sang `lessons/`.
- Nộp phần không có câu hỏi → 409 (phần lý thuyết chỉ cần mở).

**Nghiệm thu (local)**
- 5 lệnh kiểm tra pass (shared 61, exam-core 63, lang-api 235 test – thêm 10 test `lesson-attempts.service.spec.ts`: mở lượt/không lộ đáp án, private/nháp 404, lưu trữ 409, nộp từ autosave + đáp án + giải thích, làm lại giữ kết quả cũ, phần lý thuyết không nộp, học xong, version mới chỉ xem lại, bài chuyển private, ghi âm nháp → answer, chấm tay đếm lại + nộp lại bỏ điểm cũ + không chấm bài mình).
- Migration: chạy → "No changes" → revert → chạy lại OK. Lệnh dọn dữ liệu thử chạy được (thử trong transaction rồi rollback).
- API thật (:3101), `accept5.js` **47/47 mục đạt** trên bài Minna của `step4-test`: thêm Writing + Speaking vào tab Luyện tập (chưa có lượt học → vẫn version 1); học viên thấy bài ở danh sách, bản nháp 404; mở lượt (mở lại cùng lượt); response trước khi nộp không có giải thích/đáp án; autosave → nộp → 1/2 kèm đáp án + giải thích câu 1; nộp lại khi chưa Làm lại 409; Làm lại giữ kết quả cũ; nộp đúng 2/2, DB chỉ giữ answers lần gần nhất; ghi âm lên R2 thật, nghe lại bản nháp/đã nộp; mở hết tab → **Đã học xong**; Teacher thấy lượt chờ chấm, chấm 2 câu (Teacher khác chấm được) → graded, học viên thấy điểm + nhận xét; nộp lại → chờ chấm lại, answer cũ 404, vẫn học xong; lưu bài có lượt học → version 2, trang Version đếm 1 lượt ở v1; lượt v1 chỉ xem lại (Làm lại 409), mở bài → lượt mới trên v2.
- lang-app (`next start`, cookie `ls_rt`): `/t/step4-test`, trang bài học, màn hình học, Chấm bài (cả `?kind=lesson`), trang chấm bài học, trình soạn + trang version bài học đều 200. Render `LessonViewer` bằng `react-dom/server` với dữ liệu thật: phần đã nộp có "Đáp án đúng", giải thích, "Đúng 2/2 câu"; lượt chỉ xem lại không có nút Làm lại; phần nộp lại hiện "Chờ giáo viên chấm"; lượt mới không lộ giải thích, có nút "Nộp phần này". **Chưa bấm giao diện bằng trình duyệt**: danh sách Bài học ở trang trung tâm, trang bài học, màn hình học (tab, autosave, nộp, làm lại, xem kết quả lần trước, ghi âm – cần HTTPS/localhost), xem trước trong trình soạn, trang Chấm bài (Đề thi | Bài học) và chấm bài học.

**Lưu ý cho step sau**
- Step 7: thêm FK `lesson_attempts.class_item_id` → `class_items`. Step 9: lượt học trong lớp đi đường riêng (theo `class_item_id`, 1 lượt/mục/version); `canSubmitAttempt` hiện đòi `class_item_id IS NULL` và bài `visibility = tenant` – phải mở rộng cho lượt trong lớp (bài `private` học qua lớp được), lớp không `ongoing` thì chặn nộp.
- Step 10: `LessonGradingService` hiện cho mọi `GRADER_ROLES` chấm (trừ bài mình); đổi sang `canGrade` (plan 4.7) cùng lúc với đề thi.
- Step 11: bảng điểm bài học = `% đúng` lần gần nhất (`lesson_attempts.auto_correct/auto_total` đã là tổng lần nộp gần nhất) + ✔ học xong lấy từ **bất kỳ** lượt `completed` (giả định 2).
- Step 12: sự kiện "chấm xong bài học" → chuông; điểm gọi là `LessonGradingService.grade` (khi `graded_at` vừa có).
- Nhân bản đề/bài/giáo trình không chép lượt học; xoá bài học có lượt học vẫn là xoá mềm.

### Step 6 – Khoá học & giáo trình tham khảo (2026-09-19)

**Đã làm**
- Người dùng chốt đầu phiên (ghi vào plan Step 6): xoá khoá học chỉ **bỏ gắn** giáo trình; ảnh bìa qua `MediaDialog` dùng chung; danh mục đang có khoá học → xoá 409; mã khoá học theo quy tắc mã danh mục (in hoa).
- Migration `1789831276329-CreateCoursesCurricula` (sinh bằng `migration:generate`, `down` rút gọn): `courses`, `curricula`, `course_curricula` (PK kép, CASCADE theo khoá học, NO ACTION theo giáo trình), `curriculum_groups`, `curriculum_items` (CHECK đúng 1 trong `lesson_id`/`exam_id` theo `item_type`, CHECK nhãn, 2 unique theo giáo trình, FK bài/đề NO ACTION).
- lang-api `training/`: `CoursesService` (danh sách lọc tên/mã, trạng thái, danh mục; tạo/sửa/lưu trữ bằng PATCH `status`; xoá; gắn/bỏ gắn), `CurriculaService` (danh sách lọc tên/người tạo/khoá học, `creators`, chi tiết `ungrouped` + `groups`, sửa thông tin, `PUT :id/items`, nhân bản, xoá), 2 controller, `content-usage.ts` chặn xoá bài/đề đang dùng (gọi trong `LessonsService.remove`/`ExamsService.remove`). `CategoriesService` đếm `courseCount` và chặn xoá. `ROUTES` thêm 15 dòng.
- `@lang/shared` `training.ts`: `CourseStatus`, `CurriculumItemType`, `CurriculumItemLabel`, `CURRICULUM_LABELS_BY_TYPE`, giới hạn độ dài/số lượng, kiểu `Course*`/`Curriculum*`, `SaveCurriculumItemsInput`; `CategoryItem.courseCount`.
- lang-app: menu nhóm **Đào tạo** (Khoá học, Giáo trình), trang danh sách khoá học (Teacher không có nút tạo/sửa/xoá), chi tiết khoá học (ảnh bìa, tab Thông tin · Giáo trình tham khảo: gắn bằng ô chọn, bỏ gắn có xác nhận), danh sách giáo trình (lọc khoá học/người tạo, chip mã khoá học đang gắn, Nhân bản mở luôn bản sao, Xoá), trang giáo trình (`CurriculumEditor`: Chưa xếp chương + chương, kéo thả chương/mục bằng tay cầm, nút Lên/Xuống, ô chọn Chương, nhãn, tên hiển thị + ghi chú, nhãn **Đã lưu trữ**, Lưu với `baseRevision`, cảnh báo rời trang khi chưa lưu; `ContentPickerDialog` tab Bài học | Đề thi chỉ bài/đề đã publish, "Đã có"). Trang Danh mục thêm cột **Khoá học**.
- Tài liệu: `/user-manual` nhóm mới **Đào tạo** (`07-dao-tao.json`: trang Khoá học, Giáo trình; đổi tên file nhóm sau thành `08-thi-cham-bai.json`, `09-van-hanh.json`), thuật ngữ Đào tạo, ma trận quyền + menu, vai trò Chủ sở hữu/Quản trị viên/Giáo viên, danh mục (đếm/chặn xoá khoá học), xoá đề/bài học đang nằm trong giáo trình, ngoài phạm vi. CLAUDE.md (training API + lang-app).

**Sai khác so với plan**
- `courses` unique `(tenant_id, code)` thường thay vì `lower(code)`: mã luôn in hoa (CHECK), không cần index biểu thức.
- Thêm cột `curricula.revision` (plan 4.4 thiếu, cần cho `baseRevision`).
- Payload `PUT :id/items` lồng nhau: `{ baseRevision, ungrouped: Item[], groups: [{ id?, title, items }] }`, mục gửi `itemType` + `contentId`; `sort_order` của mục tính trong từng chương.
- Lưu trữ/dùng lại khoá học bằng `PATCH { status }` (không có route riêng). Thêm `GET curricula/creators` (bộ lọc người tạo).
- Chưa có bảng lớp: xoá khoá học luôn được (Step 7 chặn khi đã có lớp).

**Nghiệm thu (local)**
- 5 lệnh kiểm tra pass (shared 61, exam-core 63, lang-api 246 test – thêm 10 test `training.service.spec.ts`: giáo trình N5 3 chương + giữ id + revision 409, trùng/nhãn sai/bài nháp/bài tenant khác/id lạ 400, bài lưu trữ giữ được nhưng không thêm mới, quyền Teacher 403 + Owner sửa được + tenant khác 404, nhân bản, xoá giáo trình đang gắn 409, khoá học (mã trùng, danh mục, lưu trữ), gắn 2 khoá + xoá khoá giữ giáo trình, DTO, chặn xoá bài/đề; thêm 1 test bài học đang nằm trong giáo trình → 409; test danh mục thêm khoá học).
- Migration: chạy → "No changes" → revert → chạy lại OK.
- API thật (:3101), `accept6.js` **47/47 mục đạt** trên `step4-test`: Teacher tạo + publish 3 bài học, 3 đề (Chỉ qua lớp); Owner tạo khoá **Tiếng Nhật N5** (mã `n5` → `N5`) + khoá thứ 2, mã trùng 409, sai định dạng 400; Teacher tạo khoá 403, Student xem khoá 403; Teacher tạo giáo trình 3 chương (bài học + bài tập + kiểm tra + thi cuối khoá), đúng thứ tự/nhãn/ghi chú, `baseRevision` cũ 409, trùng/nháp/nhãn sai 400; **Teacher khác sửa/lưu mục/xoá → 403**, xem được (`canEdit=false`), nhân bản → bản của mình (không gắn khoá), sửa bản sao không ảnh hưởng bản gốc; Owner sửa giáo trình của Teacher được; Teacher gắn 403, Owner **gắn vào 2 khoá học**, gắn lại 409, lọc giáo trình theo khoá; xoá giáo trình đang gắn 409; xoá bài học/đề đang trong giáo trình 409, lưu trữ được, mục hiện `archived`, lưu lại giữ id; danh mục có khoá học → xoá 409, `courseCount` = 1; xoá khoá học → giáo trình còn.
- lang-app (`next start`, cookie `ls_rt`): `/t/step4-test/dashboard/courses`, `…/courses/{id}`, `…/curricula`, `…/curricula/{id}`, trang Danh mục đều 200. Render `CurriculumEditor` bằng `react-dom/server` với dữ liệu thật: chế độ sửa (3 chương, 7 mục, ô nhãn + ô chương, tay cầm kéo, "Gốc: Minna bài 2"), chế độ chỉ xem cho Teacher khác (không ô nhập, hiện ghi chú, nhãn). Hàm `curriculum-draft.ts` kiểm bằng script (thả trước mục, lên/xuống, cuối chương, đổi chương, xoá chương, đổi chỗ chương, payload). **Chưa bấm giao diện bằng trình duyệt**: tạo/sửa khoá học (chọn ảnh bìa), gắn/bỏ gắn, tạo giáo trình, thêm mục qua hộp chọn, kéo thả chương/mục (kể cả sang chương khác), sửa tên hiển thị/ghi chú, lưu + báo 409 khi người khác vừa lưu, cảnh báo rời trang, nhân bản.

**Lưu ý cho step sau**
- Step 7: `assertLessonNotInUse`/`assertExamNotInUse` kiểm thêm `class_items` (mục lớp chưa xoá hay cả mục đã ẩn – bài làm vẫn trỏ tới); `CoursesService.remove` chặn khi khoá học đã có lớp (409, chỉ lưu trữ); tạo lớp chỉ từ khoá học `active`; chép giáo trình sang lớp đọc `curriculum_groups`/`curriculum_items` theo `sort_order` (ungrouped = `group_id` NULL, hiện đầu tiên) – dùng lại được `CurriculaService.getDetail`. `classrooms.source_curriculum_id` nên `ON DELETE SET NULL` (xoá giáo trình không ảnh hưởng lớp đã chép). Tab **Lớp** của trang khoá học thêm ở Step 7, **Lịch** ở Step 8.
- Giáo trình lớp (Step 7) cho thêm bài/đề đã publish bất kỳ như giáo trình tham khảo; có thể dùng lại `ContentPickerDialog`, `curriculum-draft.ts` (thêm trường ngày mở, deadline… cho mục lớp).
- Giới hạn 300 mục/100 chương đặt ở `@lang/shared` (`CURRICULUM_MAX_*`).

## Prompt cho Step 7

```
Bắt đầu Step 7 của req-3 (Lớp học & giáo trình lớp).

1. Làm theo mục "Bắt đầu phiên làm việc" trong CLAUDE.md: đọc docs/requirements/req-3-progress.md (phần "Bàn giao cho phiên tiếp theo" và "Lưu ý cho step sau" của Step 5, Step 6), rồi đọc trong docs/requirements/req-3-plan.md: mục 1.2 (Lớp, Thành viên lớp, Quyền xem, Giáo trình lớp, Nhãn mục, Ngày mở/deadline, Kiểm tra/thi, Lớp kết thúc, Bài làm trong lớp), giả định 3, 4, 7 ở mục 2, thiết kế DB mục 4.5, phân quyền mục 5 (các dòng Lớp), route mục 6 (dashboard classes; API classes: list/POST/GET/PATCH/status/DELETE, teachers/students, curriculum, logs) và Step 7 ở mục 7. Chỉ mở req-3-question*.md (D1–D11, E1–E5, E9, R6, R7, R9, R10, T1, T6, U1) khi cần lý do của một quyết định.
2. Trước khi code, tóm tắt ngắn cho tôi cách làm: migration và entity (classrooms, classroom_teachers, classroom_students, class_groups, class_items, class_change_logs, cột mới exam_attempts + đổi index in_progress, FK lesson_attempts.class_item_id), service lớp (tạo từ khoá học active + chép giáo trình tham khảo, sửa thông tin, chuyển trạng thái upcoming/ongoing/finished/cancelled kể cả finished → ongoing, chốt lượt dở khi finished, xoá/huỷ theo giả định 4), giáo viên/học viên (chọn từ thành viên đúng role, sĩ số khoá dòng lớp, xoá mềm học viên), giáo trình lớp (thêm/xoá ẩn/sắp xếp, nhãn, ngày mở, deadline, nhận bài quá hạn, ngưỡng đậu, thi lại cho – phải sau mục gốc, trùng đề chỉ khi thi lại, nhập từ giáo trình, revision, nhật ký), helper quyền ClassroomAccess, chặn xoá khoá học đã có lớp và xoá bài/đề đang nằm trong giáo trình lớp, route API + dòng ROUTES mới, màn hình lang-app (danh sách lớp, trang lớp với tab Thông tin, Giáo viên & Học viên, Giáo trình, Nhật ký; tab Lớp ở trang khoá học), menu Đào tạo → Lớp học. Có chỗ nào chưa rõ hoặc mâu thuẫn thì hỏi tôi, không tự đoán.
3. Làm lần lượt: migration + service + controller kèm unit test (sĩ số, quyền giáo viên lớp, thi lại phải sau mục gốc, trùng đề chỉ khi thi lại, chuyển finished chốt lượt, baseRevision 409) → lang-app → tài liệu. Sau mỗi phần chạy test.
4. Nghiệm thu thật theo tiêu chí của plan: lớp từ khoá N5 chép đúng giáo trình "Giáo trình N5 – Minna no Nihongo" (dữ liệu Step 6 ở step4-test); giáo viên lớp sửa giáo trình lớp, Teacher ngoài lớp 403; đủ sĩ số thì chặn thêm. Cập nhật /user-manual, CLAUDE.md, req-3-progress.md và ghi prompt cho Step 8 ở cuối file. Chưa commit, chờ tôi yêu cầu.
```
