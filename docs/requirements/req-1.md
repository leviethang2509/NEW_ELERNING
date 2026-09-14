# Requirement 1

## Yêu cầu tạo dự án

Trong thư mục `lang-simulator` tôi muốn tạo 1 dự án monorepo sử dụng turporepo. Bên trong bao gồm 2 dự án là `lang-app` và `lang-api`:

- Dự án `lang-app` là frontend sử dụng tech stack tương tự `@/Users/vunguyen/Projects/lightc-general/frontend`.
- Dự án `lang-api` là backend sử dụng tech stack tương tự `@/Users/vunguyen/Projects/lightc-general/backend`.
- Database sẽ giống với `lightc-general` chỉ khác schema.
- Hạ tầng khác dùng chung với `lightc-general` cụ thể là upload file.

## Mô tả dự án

Đây là dự án multi-tenant cung cấp dịch vụ quản lý trung tâm ngoại ngữ bao gồm quản lý quá trình học tập, bài tập, bài kiểm tra và bài thi của học viên.

Hệ thống chung sẽ có role hệ thống là: `System Owner`, `System Admin` và `Registered User`.
- `System Owner` sẽ có quyền hạn cao nhất.
- `System Admin` sẽ có quyền hạn cao tiếp theo, nhưng không được tác động đến tài khoản của `System Owner`.
- `Registered User` người dùng nói chung, họ có thể đăng ký thành viên hoặc đăng ký tenant.

Đối với tenant sẽ có bộ role riêng gọi là membership bao gồm: `Tenant Owner`, `Tenant Admin`, `Teacher`, `Student` và `Parent`.
- `Tenant Owner` sẽ có quyền hạn cao nhất trong phạm vi `tenant`.
- `Tenant Admin` sẽ có quyền hạn cao tiếp theo trong phạm vi `tenant`, nhưng không được tác động đến quyền membership của `Tenant Owner`.
- `Teacher` sẽ là người có quyền soạn đề bài học, bài tập, bài thi và chấm điểm.
- `Student` sẽ là người có quyền truy cập bài học, làm bài tập, bài thi.
- `Parent` sẽ kèm theo với `Student` dưới 18 tuổi, có quyền xem kết quả học tập của con.

Account người dùng là **duy nhất** với các thông tin như `email`, `mật khẩu`, `họ và tên`, `ngày tháng năm sinh`... (hãy suggest thêm nếu cần)
- Một account có thể đóng nhiều vai trò trong 1 tenant: ví dụ 1 chủ tenant vẫn có thể là giáo viên, hoặc một giáo viên khoá học này có thể làm học viên khoá học khác.

## Mô tả kỹ thuật

Về giao diện, copy giao diện của dự án `@/Users/vunguyen/Projects/lightc-general/frontend`.

Về trình soạn thảo đề thi, phần giả lập thi và hiển thị kết quả, copy của dự án `lightc-general`.

Về deploy, hãy tạo docker file và phương án deploy lên server giống với `lightc-general`. `lightc-general` hiện tại đang chiếm port 3000 trên VPS nên dự án này sẽ chiếm port 3001.

## Yêu cầu tối thiểu

Sau khi tạo dự án, hãy tạo phần đăng ký / đăng nhập dựa trên role hệ thống.

Hệ thống sẽ bao gồm trang chính và trang dashboard với hai layout khác nhau. Layout dashboard có giao diện giống với `@/Users/vunguyen/Projects/lightc-general/frontend`.

### Trong trang Dashboard bao gồm:

Truy cập bởi `System Owner` và `System Admin`.
- Trang dashboard (tạm thời tạo trang rỗng hoặc có những thông tin cơ bản như số user, hay số lượng tenant).
- Trang quản lý `Tenant` và `User`.

Truy cập bởi `Tenant Owner` và `Tenant Admin`.
- Trang dashboard (tạm thời tạo các thông tin như số giáo viên, số học viên, tài liệu...)
- Trang quản lý `membership`.

Tiếp theo sẽ là phần quản lý đề (rất quan trọng) và có tận dụng lại của `lightc-general`.
- Trang quản lý `Danh mục đề thi` (exam_categories).
  - Ví dụ: danh mục đề thi sẽ có tiếng Anh, tiếng Nhật...
- Trang quản lý `Loại đề thi` (exam_blueprints) theo exam_categories. Mỗi exam_blueprints sẽ có nhiều exam_modules.
  - Ví dụ: loại đề thi sẽ có TOEIC, IELTS thuộc danh mục tiếng Anh, JLPT thuộc danh mục tiếng Nhật...
  - Ví dụ: exam_modules là danh sách con khi tạo exam_blueprint, như là READING, LISTENING..., mỗi module sẽ có duration tham khảo.
- Trang quản lý `Đề thi` (exam) theo exam_blueprints. Khi tạo đề thi và chọn blueprint thì cũng tự sinh ra exam_sections dựa vào exam_modules, có nhập duration thực tế, giá trị default của duration là duration tham khảo ở exam_modules.
  - Khi soạn bài, nếu exam có 4 sections thì sẽ có 4 tab ở phần soạn đề thi, mỗi tab là 1 platejs editor, sau khi nhấn save thì trong exam_sections sẽ có cột raw_data để lưu và tiện thể cho sửa sau này.
  - Khi người dùng chỉnh sửa đề thi, sẽ có hai trường hợp xảy ra. Nếu đề thi đó chưa publish hoặc chưa có ai hoàn thành thì dữ liệu của đề thi sẽ bị xoá hoàn toàn và import lại theo dữ liệu raw_data. Nếu đề thi đó đã publish và đã có người làm bài thì thêm mới và gắn version mới vào, đồng thời đổi trạng thái của version cũ sang deactivated.

Sau đó phần lưu nội dung soạn thảo của đề thi, phần giả lập thi và phần tính câu đúng thì sử dụng lại của `lang-general`.

Hãy đọc kỹ yêu cầu và đặt câu hỏi trong file `@req-1-question.md`, sau khi hiểu rõ toàn bộ hãy tạo kế hoạch implement thành nhiều step khác nhau và ghi chi tiết trong `@req-1-plan.md`.
