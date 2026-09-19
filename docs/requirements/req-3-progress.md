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
| 1 | 2 | Mẫu bài học | ✅ | 2026-09-19 | Commit 38d6470 (chưa push; deploy cùng giai đoạn 1) |
| 1 | 3 | Editor: khối mới & giải thích | ✅ | 2026-09-19 | Chưa commit; chờ người dùng bấm thử giao diện (dữ liệu thử `step3-test` còn giữ) |
| 1 | 4 | Soạn bài học | ✅ | 2026-09-19 | Chưa commit; dữ liệu thử `step4-test` còn giữ để bấm thử giao diện |
| 1 | 5 | Học bài học & chấm tay bài học | ✅ | 2026-09-19 | Chưa commit; chờ người dùng bấm thử giao diện rồi commit/push để deploy giai đoạn 1 |
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

- Giai đoạn 1 (Step 1–5) xong. Step 1 đã deploy :3001. Step 2 commit `38d6470`, Step 3–4 commit `ce4dc75` (**chưa push**). Step 5 **chưa commit**. Cuối giai đoạn 1: người dùng bấm thử giao diện, rồi yêu cầu commit + push `main` để deploy (migration `CreateLessonAttempts` chạy lúc container khởi động; không có env mới).
- **Tiếp theo: Step 6 – Khoá học & giáo trình tham khảo** (plan mục 7, DB mục 4.4, phân quyền mục 5, route mục 6). Xem "Lưu ý cho step sau" của Step 5 và prompt ở cuối file.
- Máy dev: `apps/lang-api/.env` trỏ Postgres local `lang_simulator_dev`. DB local có 14 migration, 1 System Owner, mẫu bài học hệ thống **Minna no Nihongo – 1 bài**. **Còn giữ dữ liệu thử** để người dùng bấm giao diện:
  - Step 3: tenant `step3-test` (4 đề, 1 lượt làm chờ chấm) + `step3-teacher|student|student2@example.com`.
  - Step 4–5: tenant `step4-test` (System Owner là Chủ sở hữu). Bài **Minna bài 1** của `step4-teacher` (công khai, **version 2**; tab Từ vựng có furigana/callout/khối gập mở, tab Luyện tập có Writing + Speaking, tab Bài tập 2 câu MC + 1 giải thích) và bản sao nháp **Bản của GV2** của `step4-teacher2`. `step4-student@example.com` có 2 lượt học: version 1 (đã học xong, chỉ xem lại, phần Luyện tập vừa nộp lại → **chờ chấm** ở trang Chấm bài → Bài học) và version 2 (mới mở, chưa làm gì).
  - Dọn dẹp (đã thử trong transaction, chạy được với bảng lượt học): `delete from tenants where slug in ('step3-test','step4-test'); delete from users where email like 'step3-%@example.com' or email like 'step4-%@example.com';`. File ghi âm thử nằm trên bucket R2 private (prefix `tenants/{id tenant step4-test}/lesson-attempts/`), xoá DB không xoá file. Còn schema rỗng `lang_simulator` sót lại (không ảnh hưởng).
- Chạy thử: API `node dist/main.js` (:3101, sau `pnpm build`), app `pnpm start` (:3100); **đang chạy** bản build Step 5 (log ở scratchpad phiên Step 5). Dừng Next bằng `pkill -f next-server`; trước khi chạy API mới kiểm `lsof -iTCP:3101 -sTCP:LISTEN`. Kiểm trang qua curl cần cookie `ls_rt=x`. Nghiệm thu API không cần mật khẩu: ký JWT `{ sub, tv }` bằng `JWT_SECRET` trong `.env` (mẫu: `accept5.js` trong scratchpad phiên Step 5 – `tokenOf(email)` đọc `token_version` từ DB). Không có công cụ trình duyệt – nhờ người dùng bấm thử; kiểm render không cần trình duyệt: bundle bằng esbuild (`node_modules/.pnpm/esbuild@*/node_modules/esbuild/bin/esbuild --bundle --platform=node --jsx=automatic --packages=external --alias:@=./src`, chạy trong `apps/lang-app`) rồi `renderToStaticMarkup`, chạy với `NODE_PATH=apps/lang-app/node_modules` (component có `Modal`/portal không render được kiểu này).

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

## Prompt cho Step 6

```
Bắt đầu Step 6 của req-3 (Khoá học & giáo trình tham khảo) – bước đầu giai đoạn 2.

1. Làm theo mục "Bắt đầu phiên làm việc" trong CLAUDE.md: đọc docs/requirements/req-3-progress.md (phần "Bàn giao cho phiên tiếp theo" và "Lưu ý cho step sau" của Step 5), rồi đọc trong docs/requirements/req-3-plan.md: mục 1.2 (dòng Khoá học, Giáo trình, Mục giáo trình, Nhãn mục), giả định 5 ở mục 2, thiết kế DB mục 4.4, phân quyền mục 5 (Khoá học, Giáo trình tham khảo, Gắn/bỏ giáo trình), route mục 6 (dashboard courses, curricula; API courses, curricula) và Step 6 ở mục 7. Chỉ mở req-3-question*.md (B1–B4, C1–C6, R4, R6, T1) khi cần lý do của một quyết định.
2. Trước khi code, tóm tắt ngắn cho tôi cách làm: migration và entity (courses, curricula, course_curricula, curriculum_groups, curriculum_items), TrainingModule (service khoá học, service giáo trình), quyền (Owner/Admin CRUD khoá học; Teacher xem khoá học, tạo/sửa giáo trình của mình; gắn/bỏ giáo trình chỉ Owner/Admin), lưu cả danh sách chương + mục bằng PUT :id/items với baseRevision, nhân bản giáo trình, chặn xoá bài học/đề thi đang nằm trong giáo trình (409, lưu trữ vẫn được), route API + dòng ROUTES mới, màn hình lang-app (danh sách/chi tiết khoá học với tab Giáo trình tham khảo, danh sách/chi tiết giáo trình với chương + mục kéo thả, chọn bài học/đề đã publish, nhãn, ghi chú), menu nhóm Đào tạo. Có chỗ nào chưa rõ hoặc mâu thuẫn thì hỏi tôi, không tự đoán.
3. Làm lần lượt: migration + service + controller kèm unit test (quyền Teacher, trùng mục trong giáo trình, baseRevision 409, xoá giáo trình đang gắn khoá học bị chặn, xoá bài/đề đang dùng bị chặn, nhân bản) → lang-app → tài liệu. Sau mỗi phần chạy test.
4. Nghiệm thu thật theo tiêu chí của plan: tạo khoá "Tiếng Nhật N5", giáo trình 3 chương (bài học + kiểm tra + thi cuối khoá), gắn vào 2 khoá học; Teacher sửa giáo trình người khác → 403. Cập nhật /user-manual, CLAUDE.md, req-3-progress.md và ghi prompt cho Step 7 ở cuối file. Chưa commit, chờ tôi yêu cầu.
```
