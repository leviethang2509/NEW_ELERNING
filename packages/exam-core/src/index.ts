// Logic đề thi dùng chung cho lang-app (editor, preview) và lang-api (tách cấu
// trúc, bỏ đáp án, chấm điểm). Phần thuần dữ liệu chuyển từ lightc-general
// (`components/plate/exam/*`, `labs/exam-editor/_lib/*`), không phụ thuộc
// platejs/React; plugin và giao diện editor ở lại lang-app.
export * from './answer';
export * from './blank';
export * from './grading';
export * from './id';
export * from './indicator';
export * from './list';
export * from './media';
export * from './migrate';
export * from './node';
export * from './outline';
export * from './pair';
export * from './plan';
export * from './scope';
export * from './strip';
export * from './structure';
export * from './validate';
