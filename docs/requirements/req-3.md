# Requirement 3

## Yêu cầu 3.1

Đầu tiên tôi muốn thay đổi về phần platejs editor soạn đề thi. Bây giờ nó sẽ được dùng để soạn giáo trình bao gồm bài học, bài tập, bài kiểm tra và bài thi.

Tuy nhiên hãy cứ giữ logic và behavior hiện tại của phần đề thi.

### Mô tả

**Về phần bài học**

Người dùng vẫn tạo `exam-blueprint` và `exam-module`, lúc này `exam-blueprint` sẽ là phần định nghĩa bài học, còn `exam-module` thì định nghĩa từng phần trong bài học, ví dụ 1 bài `minna no nihongo` chúng ta sẽ có phần từ vựng, ngữ pháp, bài tập nhỏ, bài tập nghe hay bài tập đọc.

Tuy nhiên khác với đề thi thì phần bài học này sẽ không có thời gian và sau khi tạo xong sẽ không vào phần giả lập thi. Lưu nó thành 1 bài học.

## Yêu cầu 3.2

Tôi muốn thêm khoá học, giáo trình học và lớp học theo khoá học.

### Mô tả

Người dùng có 1 trang đơn giản quản lý khoá học (CRUD).

**Giáo trình học**

Người dùng (tenant owner/admin và giáo viên) tạo giáo trình học theo khoá học, sau đó thêm những bài học đã tạo ở **yêu cầu 3.1** vào giáo trình và có sắp xếp thứ tự - người dùng tự sắp.

Một bài học có thể tồn tại trong nhiều giáo trình.

Ngay trong giáo trình học hoàn toàn có thể có bài kiểm tra đưa vào xen kẻ những bài học lý thuyết.

**Quan trọng** giáo trình theo khoá học là tham khảo.
```
Khoá học 1-m Giáo trình học 
Giáo trình học m-m Bài học
```

**Lớp học**

Người dùng (tenant owner/admin) tạo lớp học theo khoá học. Tạo thời khoá biểu và thêm giáo viên và học viên vào. Có tuỳ chọn giới hạn sĩ số học viên.

Sau khi tenant owner/admin đã tạo lớp theo khoá học và đưa giáo viên và học viên vào. Lúc này:
- Giáo viên có toàn quyền quyết định giáo trình học của lớp, các giáo viên phụ trách lớp sẽ thoả thuận thêm, xoá phần nào trong phần giáo trình đã định nghĩa sẵn trong khoá học.
- Giáo viên có thể set "bài học" nào là bài tập, bài kiểm tra hay bài thi và có set deadline hoàn thành.
- Học viên vẫn có thể nộp bài khi quá hạn nhưng sẽ có thống kê về độ chuyên cần.
