// Chuỗi giao diện tiếng Việt, gom một chỗ để dễ i18n về sau.
export const vi = {
  app: {
    name: 'Lang Simulator',
    tagline: 'Nền tảng quản lý trung tâm ngoại ngữ',
  },
  common: {
    loading: 'Đang tải…',
    confirm: 'Xác nhận',
    cancel: 'Hủy',
    close: 'Đóng',
    processing: 'Đang xử lý…',
    noData: 'Chưa có dữ liệu',
    comingSoon: 'Tính năng đang được phát triển.',
    backHome: 'Về trang chủ',
  },
  auth: {
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
  },
  site: {
    heroTitle: 'Quản lý trung tâm ngoại ngữ và luyện thi trên một nền tảng',
    heroText:
      'Soạn đề TOEIC, IELTS, JLPT…, tổ chức thi thử có tính giờ, chấm điểm tự động và theo dõi kết quả học viên.',
    registerCenter: 'Đăng ký trung tâm',
    myWorkspace: 'Không gian của tôi',
  },
  nav: {
    overview: 'Tổng quan',
    users: 'Người dùng',
    tenants: 'Trung tâm',
    plans: 'Gói dịch vụ',
    members: 'Thành viên',
    examCategories: 'Danh mục đề',
    examBlueprints: 'Loại đề',
    exams: 'Đề thi',
    grading: 'Chấm bài',
    sectionManagement: 'Quản lý',
    sectionExam: 'Đề thi',
  },
  shell: {
    toggleMenu: 'Mở/đóng menu',
    systemWorkspace: 'Quản trị hệ thống',
    switchWorkspace: 'Chuyển không gian làm việc',
    notSignedIn: 'Chưa đăng nhập',
  },
  pagination: {
    previous: 'Trang trước',
    next: 'Trang sau',
    pageNumber: 'Số trang',
  },
  stats: {
    users: 'Người dùng',
    tenants: 'Trung tâm',
    pendingTenants: 'Trung tâm chờ duyệt',
    teachers: 'Giáo viên',
    students: 'Học viên',
    parents: 'Phụ huynh',
    memberQuota: 'Thành viên / giới hạn gói',
    exams: 'Đề thi',
    pendingGrading: 'Bài chờ chấm',
  },
} as const;
