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

- Step 1 ✅ (đã deploy :3001). Step 2 ✅, commit `38d6470` trên `main`, **chưa push**. Step 3 ✅ và Step 4 ✅ **chưa commit** (chờ người dùng yêu cầu). Plan chỉ yêu cầu deploy lại cuối giai đoạn 1 (sau Step 5).
- **Tiếp theo: Step 5 – Học bài học & chấm tay bài học** (plan mục 7, DB mục 4.3, route learner/grading mục 6.2). Điểm xuất phát:
  - `lessons/lesson-attempt-lookup.ts` (`LessonAttemptLookup.hasAttempts`/`countByVersion`) đang luôn trả "chưa có lượt học": đổi sang đọc `lesson_attempts`, khi đó Save/khôi phục bài có lượt học tạo version mới, xoá bài có lượt học thành xoá mềm, trang Version có số lượt học. Unit test `lesson-content.service.spec.ts` đã kiểm các nhánh này bằng lookup giả.
  - Chép luồng lượt làm của đề thi (`attempts/`: `LearnerController`, `AttemptsService`, `attempt-grading.ts`, ghi âm) nhưng bài học không có đồng hồ; chấm bằng `lesson_questions` của section; giải thích lấy từ `lesson_sections.explanations` (`explanationsFor`) và **chỉ trả sau khi nộp section**.
  - Xem trước trong trình soạn (`LessonEditor`, trang version) hiện tạm dùng `PreviewDialog`/`ExamSimulator` với `aside={vi.lessonEditor.previewAside}`: đổi sang `LessonViewer`.
  - Học viên chỉ thấy bài `visibility = tenant` đã publish (như đề thi: bài `private` → 404 trừ khi đã có lượt học).
- Máy dev: `apps/lang-api/.env` trỏ Postgres local `lang_simulator_dev` (cấu hình VPS để comment `# VPS:`). DB local có 13 migration, 1 System Owner, mẫu bài học hệ thống **Minna no Nihongo – 1 bài** (`MINNA-1-BAI`, 5 phần). **Còn giữ dữ liệu thử** để người dùng bấm giao diện:
  - Step 3: tenant `step3-test` (4 đề, 1 lượt làm chờ chấm) + `step3-teacher|student|student2@example.com`.
  - Step 4: tenant `step4-test` (System Owner là Chủ sở hữu) với bài học **Minna bài 1** của `step4-teacher` (đã publish, hiển thị công khai; tab Từ vựng có furigana/callout/khối gập mở, tab Bài tập có 2 câu + 1 giải thích) và bản sao **Bản của GV2** của `step4-teacher2` + `step4-student@example.com`.
  - Kiểm xong thì xoá: `delete from tenants where slug in ('step3-test','step4-test'); delete from users where email like 'step3-%@example.com' or email like 'step4-%@example.com';`. Còn schema rỗng `lang_simulator` sót lại (không ảnh hưởng).
- Chạy thử: API `node dist/main.js` (:3101, sau `pnpm build`), app `pnpm start` (:3100); **đang chạy** bản build Step 4. Dừng Next bằng `pkill -f next-server`; trước khi chạy API mới kiểm `lsof -iTCP:3101 -sTCP:LISTEN` (tiến trình cũ còn giữ cổng thì API mới thoát ngay, request vẫn tới bản cũ). Kiểm trang qua curl cần cookie `ls_rt=x` (không có thì middleware 307 về `/login`). Nghiệm thu API không cần mật khẩu System Owner: ký JWT `{ sub, tv }` bằng `JWT_SECRET` trong `.env` (script mẫu `accept4.js` trong scratchpad phiên Step 4: tạo tenant qua `POST /tenants` + `POST /admin/tenants/:id/approve`, thành viên qua `POST /t/:slug/memberships/create-account` rồi SQL tắt `must_change_password`). So nội dung jsonb phải so với bản đọc lại từ API (Postgres sắp lại thứ tự key). Không có công cụ trình duyệt – nhờ người dùng bấm thử giao diện; kiểm render không cần trình duyệt: bundle bằng esbuild (`node_modules/.pnpm/esbuild@*/node_modules/esbuild/bin/esbuild --bundle --platform=node --jsx=automatic --packages=external --alias:@=./src`) rồi `renderToStaticMarkup`, chạy với `NODE_PATH=apps/lang-app/node_modules`.

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

## Prompt cho Step 5

```
Bắt đầu Step 5 của req-3 (Học bài học & chấm tay bài học).

1. Làm theo mục "Bắt đầu phiên làm việc" trong CLAUDE.md: đọc docs/requirements/req-3-progress.md (phần "Bàn giao cho phiên tiếp theo" và nhật ký Step 3–4), rồi đọc trong docs/requirements/req-3-plan.md: mục 1.1 (dòng Học bài, Học xong, Giải thích, Xem trước), mục 1.4 (dòng Chấm tay), giả định 2 và 10 ở mục 2, thiết kế DB mục 4.3, phân quyền mục 5, route mục 6 (learner lessons/lesson-attempts, grading lesson-attempts/lesson-answers, trang (site)/t/[slug]/lessons và lesson-attempts) và Step 5 ở mục 7. Chỉ mở req-3-question*.md (A5–A7, A9, R3, R20, R21) khi cần lý do của một quyết định.
2. Trước khi code, tóm tắt ngắn cho tôi cách làm: migration và entity (lesson_attempts, lesson_attempt_sections, lesson_attempt_answers), nối LessonAttemptLookup, những gì chép từ attempts/ và khác biệt (không đồng hồ, nộp theo section, làm lại không giới hạn chỉ giữ lần gần nhất, học xong, giải thích sau khi nộp), ghi âm, route API + dòng ROUTES mới, màn hình lang-app (danh sách bài học ở /t/{slug}, trang bài học, LessonViewer, xem trước trong trình soạn đổi sang LessonViewer, trang Chấm bài lọc Đề thi | Bài học). Có chỗ nào chưa rõ hoặc mâu thuẫn thì hỏi tôi, không tự đoán.
3. Làm lần lượt: migration + LessonAttemptsService/learner controller + chấm tay bài học kèm unit test (mở section, autosave, nộp → chấm + đáp án + giải thích, làm lại xoá chấm tay cũ, học xong, bài private 404, quyền chấm, không lộ giải thích trước khi nộp) → lib/learner-api + LessonViewer + trang học viên + trang Chấm bài → tài liệu. Sau mỗi phần chạy test.
4. Nghiệm thu thật theo tiêu chí của plan: học viên học bài Minna (mở hết tab, nộp bài tập, thấy đáp án + giải thích, làm lại, "học xong"); Speaking nộp và được chấm; kiểm response API (không có giải thích/đáp án trước khi nộp). Cập nhật /user-manual, CLAUDE.md, req-3-progress.md. Step 5 là cuối giai đoạn 1: nhắc tôi commit/push để deploy (không tự push). Chưa commit, chờ tôi yêu cầu.

Sau khi xong step 5 hãy ghi prompt cho step 6 ở cuối file req-3-progress.
```
