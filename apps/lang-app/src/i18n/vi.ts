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
    loadFailed: 'Không tải được dữ liệu',
    optional: '(không bắt buộc)',
  },
  auth: {
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    loginTitle: 'Chào mừng bạn trở lại',
    loginSubtitle:
      'Đăng nhập để vào không gian học tập và quản lý trung tâm của bạn.',
    registerTitle: 'Tạo tài khoản',
    registerSubtitle:
      'Miễn phí. Sau khi có tài khoản, bạn có thể tham gia hoặc đăng ký trung tâm.',
    email: 'Email',
    password: 'Mật khẩu',
    fullName: 'Họ và tên',
    dateOfBirth: 'Ngày sinh',
    emailPlaceholder: 'ban@email.com',
    passwordPlaceholder: 'Tối thiểu 8 ký tự',
    fullNamePlaceholder: 'Nguyễn Minh Anh',
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    loggingIn: 'Đang đăng nhập…',
    registering: 'Đang tạo tài khoản…',
    submitRegister: 'Tạo tài khoản',
    loginFailed: 'Đăng nhập thất bại',
    registerFailed: 'Đăng ký thất bại',
    invalidDateOfBirth: 'Ngày sinh không hợp lệ hoặc ở tương lai',
    passwordStrength: [
      'Hãy nhập mật khẩu',
      'Yếu — thêm chữ in hoa và số',
      'Khá — thêm ký tự đặc biệt',
      'Mạnh',
    ],
  },
  account: {
    title: 'Tài khoản của tôi',
    profile: 'Hồ sơ',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    gender: 'Giới tính',
    genderUnset: 'Không chọn',
    save: 'Lưu thay đổi',
    profileSaved: 'Đã lưu hồ sơ.',
    saveFailed: 'Lưu thất bại',
    changePassword: 'Đổi mật khẩu',
    changePasswordHint:
      'Sau khi đổi, các thiết bị khác đang đăng nhập sẽ bị đăng xuất.',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Nhập lại mật khẩu mới',
    passwordMismatch: 'Mật khẩu nhập lại không khớp',
    passwordChanged: 'Đã đổi mật khẩu.',
    mustChange:
      'Tài khoản đang dùng mật khẩu tạm. Bạn cần đổi mật khẩu trước khi tiếp tục.',
  },
  gender: {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  },
  tenantRoles: {
    TENANT_OWNER: 'Chủ sở hữu',
    TENANT_ADMIN: 'Quản trị viên',
    TEACHER: 'Giáo viên',
    STUDENT: 'Học viên',
    PARENT: 'Phụ huynh',
  },
  systemRoles: {
    SYSTEM_OWNER: 'System Owner',
    SYSTEM_ADMIN: 'System Admin',
    REGISTERED_USER: 'Người dùng',
  },
  userStatus: {
    active: 'Hoạt động',
    locked: 'Đã khoá',
  },
  tenantStatus: {
    pending: 'Chờ duyệt',
    active: 'Đang hoạt động',
    rejected: 'Bị từ chối',
    suspended: 'Tạm khoá',
  },
  membershipStatus: {
    active: 'Đang hoạt động',
    inactive: 'Ngừng kích hoạt',
  },
  admin: {
    loadFailed: 'Không tải được dữ liệu',
    actionFailed: 'Thao tác thất bại',
    all: 'Tất cả',
    actions: 'Thao tác',
    save: 'Lưu',
    stats: {
      newUsers: 'Người dùng mới (7 ngày)',
      lockedUsers: 'Tài khoản bị khoá',
      activeTenants: 'Trung tâm đang hoạt động',
    },
    users: {
      subtitle: 'Tạo, sửa, khoá tài khoản và reset mật khẩu người dùng.',
      create: 'Tạo người dùng',
      edit: 'Sửa người dùng',
      column: 'Người dùng',
      systemRole: 'Vai trò',
      status: 'Trạng thái',
      lastLogin: 'Đăng nhập cuối',
      createdAt: 'Ngày tạo',
      neverLoggedIn: 'Chưa đăng nhập',
      searchPlaceholder: 'Tìm theo họ tên hoặc email…',
      allRoles: 'Mọi vai trò',
      allStatuses: 'Mọi trạng thái',
      mustChangePassword: 'Chờ đổi mật khẩu',
      empty: 'Không có người dùng nào khớp.',
      ownerOnly: 'Chỉ System Owner thao tác được tài khoản quản trị',
      temporaryPassword: 'Mật khẩu tạm',
      passwordHint:
        'Để trống để hệ thống sinh mật khẩu tạm. Người dùng phải đổi mật khẩu ở lần đăng nhập đầu.',
      resetPassword: 'Reset mật khẩu',
      resetHint:
        'Người dùng bị đăng xuất khỏi mọi thiết bị và phải đổi mật khẩu ở lần đăng nhập sau.',
      changeRole: 'Đổi vai trò hệ thống',
      changeRoleHint:
        'Hệ thống luôn cần ít nhất một System Owner đang hoạt động.',
      lock: 'Khoá tài khoản',
      unlock: 'Mở khoá tài khoản',
      lockConfirm: (name: string) =>
        `Khoá tài khoản của ${name}? Người dùng bị đăng xuất ngay và không đăng nhập được cho tới khi mở khoá.`,
      unlockConfirm: (name: string) => `Mở khoá tài khoản của ${name}?`,
      created: 'Đã tạo tài khoản',
      passwordReset: 'Đã reset mật khẩu',
    },
    password: {
      account: 'Tài khoản',
      copy: 'Sao chép',
      copied: 'Đã chép',
      showOnce:
        'Mật khẩu chỉ hiển thị một lần. Hãy gửi cho người dùng qua kênh an toàn.',
      setByAdmin: 'Mật khẩu là mật khẩu bạn vừa nhập.',
      mustChange: 'Người dùng phải đổi mật khẩu ở lần đăng nhập tới.',
    },
    tenants: {
      subtitle: 'Duyệt đăng ký, tạm khoá và đổi gói dịch vụ của trung tâm.',
      column: 'Trung tâm',
      owner: 'Chủ trung tâm',
      plan: 'Gói',
      members: 'Thành viên',
      status: 'Trạng thái',
      createdAt: 'Ngày đăng ký',
      detail: 'Chi tiết',
      searchPlaceholder: 'Tìm theo tên, đường dẫn hoặc chủ trung tâm…',
      empty: 'Không có trung tâm nào.',
      overLimit: 'Vượt giới hạn',
      overLimitWarning: (active: number, max: number) =>
        `Trung tâm đang có ${active} thành viên, vượt giới hạn ${max} của gói này. Thành viên hiện có được giữ nguyên; trung tâm chỉ bị chặn thêm thành viên cho tới khi giảm xuống.`,
      url: 'Đường dẫn',
      email: 'Email',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      description: 'Mô tả',
      rejectionReason: 'Lý do từ chối',
      suspensionReason: 'Lý do tạm khoá',
      lastReview: 'Xử lý gần nhất',
      approve: 'Duyệt',
      approveConfirm: (name: string) =>
        `Duyệt trung tâm ${name}? Chủ trung tâm vào được dashboard ngay.`,
      reject: 'Từ chối',
      rejectReasonLabel: 'Lý do từ chối (chủ trung tâm sẽ thấy)',
      suspend: 'Tạm khoá',
      suspendReasonLabel: 'Lý do tạm khoá',
      unsuspend: 'Mở khoá',
      unsuspendConfirm: (name: string) => `Mở khoá trung tâm ${name}?`,
      changePlan: 'Đổi gói',
      currentPlan: '(hiện tại)',
      planOption: (name: string, max: number) =>
        `${name} – tối đa ${max.toLocaleString('vi-VN')} thành viên`,
    },
    plans: {
      subtitle:
        'Gói dịch vụ giới hạn số thành viên đang hoạt động của trung tâm.',
      create: 'Tạo gói',
      edit: 'Sửa gói',
      code: 'Mã gói',
      codeHint:
        'Chữ thường không dấu, số, "-" hoặc "_". Không đổi được sau khi tạo.',
      name: 'Tên gói',
      maxMembers: 'Thành viên tối đa',
      price: 'Giá (VNĐ)',
      description: 'Mô tả',
      sortOrder: 'Thứ tự',
      isActive: 'Đang áp dụng',
      inactive: 'Ngừng áp dụng',
      activeHint:
        'Gói ngừng áp dụng không chọn được khi đăng ký hay đổi gói; trung tâm đang dùng giữ nguyên.',
      tenantCount: 'Trung tâm',
      empty: 'Chưa có gói dịch vụ.',
      delete: 'Xoá gói',
      deleteConfirm: (name: string) =>
        `Xoá gói ${name}? Thao tác không hoàn tác được.`,
      inUse: 'Gói đang có trung tâm sử dụng, chỉ có thể ngừng áp dụng',
    },
  },
  me: {
    title: 'Không gian của tôi',
    greeting: (name: string) => `Xin chào, ${name}`,
    systemDescription: 'Quản lý người dùng, trung tâm và gói dịch vụ.',
    accountDescription: 'Cập nhật hồ sơ và đổi mật khẩu.',
    tenantsHeading: 'Trung tâm của tôi',
    noTenants: 'Bạn chưa là thành viên của trung tâm nào.',
    noTenantsHint:
      'Hãy đăng ký trung tâm của bạn, hoặc nhờ trung tâm thêm tài khoản này vào danh sách thành viên.',
    registerTenant: 'Đăng ký trung tâm',
    openDashboard: 'Vào dashboard',
    openTenant: 'Trang trung tâm',
    editAndResubmit: 'Sửa và gửi lại',
    pendingHint:
      'Đăng ký đang chờ System Admin duyệt. Bạn vào được trung tâm ngay sau khi được duyệt.',
    rejectedHint:
      'Đăng ký bị từ chối. Hãy sửa thông tin theo lý do bên dưới rồi gửi lại.',
    suspendedHint:
      'Trung tâm đang bị tạm khoá, mọi thành viên tạm thời không vào được.',
    reason: 'Lý do',
    plan: (name: string, max: number) =>
      `Gói ${name} · tối đa ${max.toLocaleString('vi-VN')} thành viên`,
  },
  tenantForm: {
    createTitle: 'Đăng ký trung tâm',
    createSubtitle:
      'Sau khi gửi, System Admin sẽ xem xét và duyệt đăng ký. Bạn là chủ sở hữu của trung tâm.',
    resubmitTitle: 'Sửa và gửi lại đăng ký',
    resubmitSubtitle:
      'Đăng ký sẽ quay về trạng thái chờ duyệt sau khi bạn gửi lại.',
    backToMe: 'Không gian của tôi',
    infoSection: 'Thông tin trung tâm',
    planSection: 'Gói dịch vụ',
    planHint:
      'Gói giới hạn số thành viên đang hoạt động. System Admin có thể đổi gói sau khi duyệt.',
    name: 'Tên trung tâm',
    namePlaceholder: 'Trung tâm Ngoại ngữ Á Châu',
    logo: 'Logo',
    logoHint:
      'Ảnh vuông, tối đa 5MB. Để trống thì dùng chữ cái đầu của tên trung tâm.',
    logoUpload: 'Chọn ảnh',
    logoChange: 'Đổi ảnh',
    logoRemove: 'Bỏ logo',
    logoFailed: 'Tải logo thất bại',
    slug: 'Đường dẫn',
    slugHint:
      '3–40 ký tự: chữ thường không dấu, số và dấu gạch nối. Để trống thì hệ thống tự tạo từ tên.',
    slugErrors: {
      length: 'Đường dẫn phải từ 3 đến 40 ký tự',
      format:
        'Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối ở giữa',
      reserved: 'Đường dẫn này đã được hệ thống dành riêng',
    },
    description: 'Giới thiệu',
    descriptionPlaceholder:
      'Các khoá học, kỳ thi luyện tập, địa điểm học… hiển thị trên trang trung tâm.',
    email: 'Email liên hệ',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    maxMembers: (max: number) =>
      `Tối đa ${max.toLocaleString('vi-VN')} thành viên`,
    priceContact: 'Liên hệ',
    noPlans: 'Chưa có gói dịch vụ nào đang áp dụng.',
    submit: 'Gửi đăng ký',
    resubmit: 'Gửi lại',
    underAge: (age: number) => `Bạn cần đủ ${age} tuổi để đăng ký trung tâm.`,
    rejectionReason: 'Lý do từ chối',
    notFound: 'Không tìm thấy đăng ký trung tâm này.',
    notRejected:
      'Chỉ sửa và gửi lại được khi đăng ký đang ở trạng thái bị từ chối.',
  },
  tenantAccess: {
    notFound: {
      title: 'Không tìm thấy trung tâm',
      text: 'Đường dẫn không đúng, trung tâm chưa hoạt động hoặc bạn không phải thành viên.',
    },
    pending: {
      title: 'Trung tâm đang chờ duyệt',
      text: 'Trung tâm chưa hoạt động. Chủ sở hữu vào được ngay sau khi System Admin duyệt đăng ký.',
    },
    rejected: {
      title: 'Đăng ký trung tâm bị từ chối',
      text: 'Chủ sở hữu có thể sửa thông tin và gửi lại trong Không gian của tôi.',
    },
    suspended: {
      title: 'Trung tâm đang tạm khoá',
      text: 'Thành viên tạm thời không vào được trung tâm. Vui lòng quay lại sau hoặc liên hệ trung tâm.',
    },
    noDashboard: {
      title: 'Bạn không có quyền vào dashboard',
      text: 'Dashboard dành cho Chủ sở hữu, Quản trị viên và Giáo viên. Bạn vẫn xem được trang trung tâm.',
    },
  },
  tenantPage: {
    yourRoles: 'Vai trò của bạn',
    examsHeading: 'Đề thi',
    noExams: 'Trung tâm chưa công bố đề thi nào.',
    notMember:
      'Bạn chưa là thành viên của trung tâm này. Hãy liên hệ trung tâm để được thêm vào.',
    loginToJoin:
      'Là thành viên của trung tâm? Đăng nhập để xem đề thi và làm bài.',
  },
  tenantDashboard: {
    overLimit: ({
      activeMembers,
      maxMembers,
      planName,
      excess,
    }: {
      activeMembers: number;
      maxMembers: number;
      planName: string;
      excess: number;
    }) =>
      `Trung tâm đang có ${activeMembers.toLocaleString('vi-VN')} thành viên, vượt giới hạn ${maxMembers.toLocaleString('vi-VN')} của gói ${planName}. Cần ngừng kích hoạt ${excess.toLocaleString('vi-VN')} thành viên để khớp gói; tới lúc đó chưa thêm hay kích hoạt lại thành viên được.`,
    manageMembers: 'Quản lý thành viên',
    viewSuggestions: 'Xem gợi ý',
    examsDraft: 'Đề nháp',
    examsPublished: 'Đề đã công bố',
    examsArchived: 'Đề lưu trữ',
    attempts: 'Lượt làm bài',
  },
  members: {
    subtitle:
      'Thêm thành viên, phân vai trò, ngừng kích hoạt và gắn phụ huynh cho học viên.',
    quota: (active: number, max: number) =>
      `${active.toLocaleString('vi-VN')} / ${max.toLocaleString('vi-VN')} thành viên`,
    full: (max: number, plan: string) =>
      `Đã đạt giới hạn ${max.toLocaleString('vi-VN')} thành viên của gói ${plan}, chưa thêm được thành viên mới.`,
    addByEmail: 'Thêm theo email',
    addByEmailHint:
      'Người dùng phải có tài khoản sẵn. Chưa có thì dùng "Tạo tài khoản".',
    add: 'Thêm',
    createAccount: 'Tạo tài khoản',
    created: 'Đã tạo tài khoản thành viên',
    column: 'Thành viên',
    roles: 'Vai trò',
    rolesRequired: 'Vui lòng chọn ít nhất một vai trò',
    status: 'Trạng thái',
    lastActive: 'Lần vào gần nhất',
    neverActive: 'Chưa từng vào',
    joinedAt: 'Ngày tham gia',
    searchPlaceholder: 'Tìm theo họ tên hoặc email…',
    allRoles: 'Mọi vai trò',
    allStatuses: 'Mọi trạng thái',
    empty: 'Không có thành viên nào khớp.',
    minor: '< 18 tuổi',
    detail: 'Chi tiết thành viên',
    ownerLocked: 'Chỉ chủ sở hữu thao tác được trên tài khoản chủ sở hữu',
    ownerRoleFixed:
      'Vai trò Chủ sở hữu cố định; bạn có thể thêm các vai trò khác cho mình.',
    saveRoles: 'Lưu vai trò',
    rolesSaved: 'Đã lưu vai trò.',
    deactivate: 'Ngừng kích hoạt',
    activate: 'Kích hoạt lại',
    deactivateConfirm: (name: string) =>
      `Ngừng kích hoạt ${name}? Thành viên không vào được trung tâm và không còn tính vào giới hạn gói.`,
    activateConfirm: (name: string) =>
      `Kích hoạt lại ${name}? Thành viên được tính lại vào giới hạn gói.`,
    remove: 'Xoá khỏi trung tâm',
    removeConfirm: (name: string) =>
      `Xoá ${name} khỏi trung tâm? Liên kết phụ huynh của thành viên này cũng bị gỡ; tài khoản vẫn giữ nguyên.`,
    guardians: 'Phụ huynh',
    noGuardians: 'Chưa gắn phụ huynh.',
    wards: 'Học viên được giám hộ',
    noWards: 'Chưa gắn với học viên nào.',
    chooseParent: 'Chọn phụ huynh',
    parentSearch: 'Tìm thành viên có vai trò Phụ huynh…',
    noParents: 'Không có Phụ huynh nào khớp.',
    relationship: 'Quan hệ',
    relationshipPlaceholder: 'Vd. Mẹ, Bố',
    link: 'Gắn phụ huynh',
    unlink: 'Gỡ liên kết',
    suggestionsTitle: 'Gợi ý ngừng kích hoạt',
    suggestionsHint: (excess: number) =>
      `Cần ngừng kích hoạt ${excess.toLocaleString('vi-VN')} thành viên. Danh sách gồm Học viên/Phụ huynh lâu không vào trung tâm, người chưa từng vào xếp trước. Đây chỉ là gợi ý, bạn tự quyết định.`,
    noSuggestions:
      'Không còn Học viên/Phụ huynh nào để gợi ý. Hãy xem lại các thành viên khác trong danh sách.',
    withinLimit: 'Số thành viên đã khớp giới hạn gói.',
  },
  site: {
    navFeatures: 'Tính năng',
    navPlans: 'Gói dịch vụ',
    heroBadge: 'TOEIC · IELTS · JLPT',
    heroTitle: 'Luyện thi ngoại ngữ cho cả trung tâm, trên một nền tảng.',
    heroText:
      'Soạn đề theo cấu trúc kỳ thi, cho học viên thi thử có tính giờ, chấm tự động phần trắc nghiệm và để giáo viên chấm Writing, Speaking.',
    registerCenter: 'Đăng ký trung tâm',
    viewPlans: 'Xem gói dịch vụ',
    myWorkspace: 'Không gian của tôi',
    heroNote:
      'Học viên và giáo viên: đăng nhập bằng tài khoản trung tâm cấp để vào thi hoặc soạn đề.',
    preview: {
      title: 'Đề thi thử · IELTS Academic',
      duration: '165 phút',
      sections: [
        {
          title: 'Listening',
          meta: '4 part · 40 câu · chấm tự động',
          value: '30 phút',
        },
        {
          title: 'Reading',
          meta: '3 passage · 40 câu · chấm tự động',
          value: '60 phút',
        },
        { title: 'Writing', meta: '2 task · giáo viên chấm', value: '60 phút' },
        {
          title: 'Speaking',
          meta: '3 part · ghi âm trên trình duyệt',
          value: '15 phút',
        },
      ],
      progressLabel: 'Đang làm · Section 2/4',
      progressValue: 'còn 42:10',
      stats: [
        { value: '5', label: 'vai trò trong trung tâm' },
        { value: '4', label: 'kỹ năng Nghe · Đọc · Viết · Nói' },
        { value: '0–10', label: 'thang điểm chấm tay' },
      ],
    },
    featuresEyebrow: 'Tính năng',
    featuresTitle:
      'Từ soạn đề tới chấm bài, gọn trong không gian của trung tâm',
    features: [
      {
        title: 'Soạn đề theo cấu trúc kỳ thi',
        body: 'Tạo đề từ loại đề dựng sẵn cho TOEIC, IELTS, JLPT; mỗi section là một tab soạn thảo riêng, tự lưu phiên bản khi đề đã có bài làm.',
        stat: '↳ đánh số câu lại từ 1 mỗi section',
      },
      {
        title: 'Thi thử có tính giờ',
        body: 'Học viên làm từng section với đồng hồ đếm ngược, hết giờ tự nộp; phần Speaking ghi âm ngay trên trình duyệt.',
        stat: '↳ tải lại trang vẫn giữ bài và thời gian',
      },
      {
        title: 'Chấm tự động và chấm tay',
        body: 'Trắc nghiệm chấm ở server nên không lộ đáp án; giáo viên chấm Writing, Speaking kèm điểm và nhận xét.',
        stat: '↳ học viên xem kết quả theo từng section',
      },
    ],
    plansEyebrow: 'Gói dịch vụ',
    plansTitle: 'Chọn gói theo quy mô trung tâm',
    plansText:
      'Gói giới hạn số thành viên đang hoạt động, gồm giáo viên, học viên và phụ huynh. Đăng ký được System Admin duyệt, gói có thể đổi sau.',
    choosePlan: 'Chọn gói này',
    plansFailed: 'Không tải được danh sách gói dịch vụ.',
    footerText:
      'Nền tảng quản lý trung tâm ngoại ngữ: soạn đề, thi thử có tính giờ và chấm bài.',
    footerProduct: 'Sản phẩm',
    footerAccount: 'Tài khoản',
  },
  media: {
    title: 'Thư viện media',
    subtitle:
      'Ảnh, audio và video dùng trong đề thi của trung tâm. Ảnh được chuyển sang WebP khi tải lên.',
    upload: 'Tải lên',
    uploading: 'Đang tải lên…',
    uploadFailed: 'Tải lên thất bại',
    pickFile: 'Chọn file từ máy',
    empty: 'Chưa có file nào.',
    notConfigured: (reason: string) =>
      `Chưa cấu hình Cloudflare R2 (${reason}) nên không tải lên được.`,
    columns: {
      file: 'File',
      kind: 'Loại',
      size: 'Dung lượng',
      uploadedAt: 'Tải lên',
      actions: 'Thao tác',
    },
    kinds: { image: 'Ảnh', audio: 'Audio', video: 'Video' },
    copyUrl: 'Chép URL',
    copied: 'Đã chép URL vào clipboard.',
    copyFailed: 'Không chép được URL.',
    openInNewTab: 'Mở trong tab mới',
    remove: 'Xoá file',
    removeTitle: 'Xoá file media?',
    removeText:
      'File bị xoá khỏi kho lưu trữ. Đề nào đang dùng file này sẽ không hiển thị được nữa.',
    removeFailed: 'Xoá thất bại',
    removed: 'Đã xoá file.',
    insertTitle: {
      image: 'Chèn hình ảnh',
      audio: 'Chèn audio',
      video: 'Chèn video',
    },
    sizeHint: {
      image: (bytes: number) =>
        `Ảnh tối đa ${Math.round(bytes / 1024 / 1024)}MB, tự chuyển sang WebP.`,
      audio: (bytes: number) =>
        `Audio tối đa ${Math.round(bytes / 1024 / 1024)}MB (đủ cho một đề nghe ~30 phút).`,
      video: (bytes: number) =>
        `Video tối đa ${Math.round(bytes / 1024 / 1024)}MB.`,
    },
    orPasteUrl: 'hoặc dán URL',
    insertUrl: 'Chèn URL',
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
    media: 'Thư viện media',
    grading: 'Chấm bài',
    sectionManagement: 'Quản lý',
    sectionExam: 'Đề thi',
  },
  shell: {
    toggleMenu: 'Mở/đóng menu',
    systemWorkspace: 'Quản trị hệ thống',
    switchWorkspace: 'Chuyển không gian làm việc',
    allWorkspaces: 'Tất cả trong Không gian của tôi',
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
