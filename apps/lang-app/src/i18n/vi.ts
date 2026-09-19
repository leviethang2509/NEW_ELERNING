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
    backHome: 'Về trang chủ',
    loadFailed: 'Không tải được dữ liệu',
    retry: 'Thử lại',
    notFoundTitle: 'Không tìm thấy trang',
    notFoundText: 'Đường dẫn không tồn tại hoặc trang đã bị gỡ.',
    errorTitle: 'Đã có lỗi xảy ra',
    errorText:
      'Trang gặp lỗi không mong đợi. Bạn thử tải lại, nếu vẫn lỗi hãy quay lại sau.',
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
  catalog: {
    scope: { system: 'Hệ thống', tenant: 'Trung tâm' },
    systemHint: 'Mục của hệ thống chỉ xem được',
    allScopes: 'Mọi phạm vi',
    allStatuses: 'Mọi trạng thái',
    active: 'Đang dùng',
    inactive: 'Ngừng dùng',
    code: 'Mã',
    codeHint:
      'Chữ in hoa không dấu, số, "-" hoặc "_" (tự đổi sang in hoa). Không trùng trong cùng phạm vi.',
    name: 'Tên',
    description: 'Mô tả',
    sortOrder: 'Thứ tự',
    status: 'Trạng thái',
    scopeColumn: 'Phạm vi',
    actions: 'Thao tác',
    view: 'Xem chi tiết',
    readOnly: 'Bạn chỉ có quyền xem.',
    saveFailed: 'Lưu thất bại',
    deleteFailed: 'Xoá thất bại',
    categories: {
      subtitle:
        'Nhóm loại đề và mẫu bài học theo ngôn ngữ hoặc chương trình (Tiếng Anh, Tiếng Nhật…).',
      tenantSubtitle:
        'Gồm danh mục của hệ thống và danh mục riêng của trung tâm, dùng chung cho loại đề và mẫu bài học.',
      create: 'Tạo danh mục',
      edit: 'Sửa danh mục',
      delete: 'Xoá danh mục',
      deleteConfirm: (name: string) =>
        `Xoá danh mục ${name}? Thao tác không hoàn tác được.`,
      inUse: 'Danh mục đang có loại đề hoặc mẫu bài học, chỉ có thể ngừng dùng',
      examBlueprintCount: 'Loại đề',
      lessonBlueprintCount: 'Mẫu bài học',
      icon: 'Biểu tượng',
      color: 'Màu',
      activeHint:
        'Danh mục ngừng dùng không chọn được khi tạo loại đề, mẫu bài học mới; mục đã có giữ nguyên.',
      empty: 'Chưa có danh mục.',
      searchPlaceholder: 'Tìm theo tên hoặc mã danh mục',
    },
    blueprints: {
      subtitle:
        'Loại đề gồm các module (Listening, Reading…) với thời lượng tham khảo, dùng để sinh section khi tạo đề.',
      tenantSubtitle:
        'Gồm loại đề của hệ thống và loại đề riêng của trung tâm. Loại đề của trung tâm có thể thuộc danh mục hệ thống.',
      create: 'Tạo loại đề',
      edit: 'Sửa loại đề',
      detail: 'Chi tiết loại đề',
      delete: 'Xoá loại đề',
      deleteConfirm: (name: string) =>
        `Xoá loại đề ${name} cùng các module? Thao tác không hoàn tác được.`,
      category: 'Danh mục',
      allCategories: 'Mọi danh mục',
      chooseCategory: 'Chọn danh mục',
      noCategory:
        'Chưa có danh mục đang dùng. Hãy tạo danh mục trước khi tạo loại đề.',
      inactiveCategory: (name: string) => `${name} (ngừng dùng)`,
      modules: 'Module',
      examCount: 'Số đề',
      examCountHint: 'Số đề thi của mọi trung tâm dùng loại đề này',
      examCountTenantHint: 'Số đề thi của trung tâm dùng loại đề này',
      inUse: 'Loại đề đang có đề thi, chỉ có thể ngừng dùng',
      moduleCount: (count: number, minutes: number) =>
        `${count} module · ${minutes} phút`,
      activeHint:
        'Loại đề ngừng dùng không chọn được khi tạo đề mới; đề đã tạo giữ nguyên.',
      empty: 'Chưa có loại đề.',
      searchPlaceholder: 'Tìm theo tên hoặc mã loại đề',
      moduleName: 'Tên module',
      moduleCode: 'Mã module',
      moduleDuration: 'Thời lượng tham khảo',
      moduleDescription: 'Mô tả module',
      addModule: 'Thêm module',
      removeModule: 'Xoá module',
      moveUp: 'Chuyển lên',
      moveDown: 'Chuyển xuống',
      dragHint: 'Kéo để sắp xếp',
      modulesHint:
        'Kéo thả hoặc dùng nút mũi tên để sắp xếp. Sửa module không ảnh hưởng đề đã tạo.',
      minutes: (value: number) => `${value} phút`,
      needModule: 'Loại đề phải có ít nhất 1 module',
      duplicateModuleCode: (code: string) => `Mã module bị trùng: ${code}`,
    },
    lessonBlueprints: {
      subtitle:
        'Mẫu bài học gồm các phần (Từ vựng, Ngữ pháp…), dùng để sinh section khi tạo bài học. Phần không có thời lượng.',
      tenantSubtitle:
        'Gồm mẫu bài học của hệ thống và mẫu riêng của trung tâm. Mẫu của trung tâm có thể thuộc danh mục hệ thống.',
      create: 'Tạo mẫu bài học',
      edit: 'Sửa mẫu bài học',
      detail: 'Chi tiết mẫu bài học',
      delete: 'Xoá mẫu bài học',
      deleteConfirm: (name: string) =>
        `Xoá mẫu bài học ${name} cùng các phần? Thao tác không hoàn tác được.`,
      noCategory:
        'Chưa có danh mục đang dùng. Hãy tạo danh mục trước khi tạo mẫu bài học.',
      modules: 'Phần',
      moduleCount: (count: number) => `${count} phần`,
      lessonCount: 'Số bài học',
      lessonCountHint: 'Số bài học của mọi trung tâm dùng mẫu này',
      lessonCountTenantHint: 'Số bài học của trung tâm dùng mẫu này',
      inUse: 'Mẫu đang có bài học, chỉ có thể ngừng dùng',
      activeHint:
        'Mẫu ngừng dùng không chọn được khi tạo bài học mới; bài học đã tạo giữ nguyên.',
      empty: 'Chưa có mẫu bài học.',
      searchPlaceholder: 'Tìm theo tên hoặc mã mẫu bài học',
      moduleName: 'Tên phần',
      moduleCode: 'Mã phần',
      moduleDescription: 'Mô tả phần',
      addModule: 'Thêm phần',
      removeModule: 'Xoá phần',
      modulesHint:
        'Kéo thả hoặc dùng nút mũi tên để sắp xếp. Sửa phần không ảnh hưởng bài học đã tạo.',
      needModule: 'Mẫu bài học phải có ít nhất 1 phần',
      duplicateModuleCode: (code: string) => `Mã phần bị trùng: ${code}`,
    },
  },
  exams: {
    subtitle:
      'Tạo đề từ loại đề, soạn nội dung từng section và publish cho học viên. Teacher sửa được đề do mình tạo, xem được mọi đề.',
    create: 'Tạo đề',
    column: 'Đề thi',
    content: 'Nội dung',
    statusColumn: 'Trạng thái',
    creator: 'Người tạo',
    updatedAt: 'Cập nhật',
    noCreator: '—',
    empty: 'Chưa có đề thi nào.',
    searchPlaceholder: 'Tìm theo tên đề',
    allStatuses: 'Mọi trạng thái',
    allCategories: 'Mọi danh mục',
    allBlueprints: 'Mọi loại đề',
    allCreators: 'Mọi người tạo',
    status: {
      draft: 'Nháp',
      published: 'Đã publish',
      archived: 'Lưu trữ',
    },
    contentSummary: (sections: number, minutes: number) =>
      `${sections} section · ${minutes} phút`,
    questionSummary: (questions: number, version: number) =>
      `${questions} câu · version ${version}`,
    edit: 'Soạn đề',
    view: 'Xem đề',
    clone: 'Nhân bản',
    cloneConfirm: (title: string) =>
      `Nhân bản đề ${title}? Bản sao là đề nháp mới của bạn, chép nội dung version hiện tại (media dùng chung với đề gốc), không chép bài làm.`,
    cloned: (title: string) => `Đã nhân bản thành ${title}.`,
    visibility: {
      tenant: 'Công khai trong trung tâm',
      private: 'Chỉ qua lớp',
    },
    privateBadge: 'Chỉ qua lớp',
    clonedFrom: (title: string) => `Bản sao của ${title}`,
    versions: 'Các version',
    publish: 'Publish',
    republish: 'Publish lại',
    archive: 'Lưu trữ',
    delete: 'Xoá đề',
    actionFailed: 'Thao tác thất bại',
    publishedNotice: (title: string) => `Đã publish đề ${title}.`,
    archived: (title: string) => `Đã lưu trữ đề ${title}.`,
    deleted: (title: string) => `Đã xoá đề ${title}.`,
    archiveConfirm: (title: string) =>
      `Lưu trữ đề ${title}? Học viên không thấy đề nữa; bạn vẫn sửa và publish lại được.`,
    deleteConfirm: (title: string) =>
      `Xoá đề ${title}? Đề chưa có bài làm bị xoá hẳn; đề đã có bài làm được ẩn đi để giữ kết quả.`,
    form: {
      createTitle: 'Tạo đề thi',
      editTitle: 'Thông tin đề',
      create: 'Tạo và soạn đề',
      save: 'Lưu thông tin',
      blueprint: 'Loại đề',
      chooseBlueprint: 'Chọn loại đề',
      noBlueprint:
        'Chưa có loại đề đang dùng. Hãy nhờ Owner/Admin tạo loại đề trước.',
      blueprintOption: (name: string, modules: number, scope: string) =>
        `${name} · ${modules} module · ${scope}`,
      inactiveBlueprint: (name: string) => `${name} (ngừng dùng)`,
      sectionsFromModules: (modules: string) =>
        `Đề sẽ có các section: ${modules}. Sau khi tạo vẫn thêm/xoá/đổi được.`,
      blueprintChangeHint:
        'Đổi loại đề không đổi các section đang có; dùng "Thêm section → từ module" để thêm section của loại đề mới.',
      title: 'Tên đề',
      titlePlaceholder: 'VD: IELTS Mock Test 01',
      description: 'Mô tả',
      visibility: 'Hiển thị',
      visibilityHint: {
        tenant:
          'Mọi thành viên thấy đề ở trang trung tâm và làm tự do (khi đề đã publish).',
        private:
          'Không hiện ở trang trung tâm; học viên chỉ làm khi đề được giao qua lớp. Bài làm tự do cũ vẫn xem lại được.',
      },
    },
    versionsPage: {
      back: 'Về trình soạn',
      subtitle:
        'Version mới chỉ được tạo khi lưu đề mà version hiện tại đã có bài làm. Khôi phục = lưu lại nội dung version đó theo cùng quy tắc.',
      version: 'Version',
      current: 'Hiện tại',
      savedAt: 'Lưu lúc',
      savedBy: 'Người lưu',
      attempts: 'Bài làm',
      questions: (count: number) => `${count} câu`,
      view: 'Xem nội dung',
      restore: 'Khôi phục version',
      restoreOverwrite: (version: number, current: number) =>
        `Nội dung version ${current} (chưa có bài làm) sẽ bị ghi đè bằng nội dung version ${version}. Tiếp tục?`,
      restoreAsNew: (version: number, next: number) =>
        `Version hiện tại đã có bài làm nên sẽ tạo version ${next} với nội dung version ${version}. Tiếp tục?`,
      restored: (version: number, current: number) =>
        `Đã khôi phục nội dung version ${version} thành version ${current}.`,
      empty: 'Chưa có version nào.',
    },
  },
  // Bài học (req-3 Step 4): chuỗi riêng, phần giống đề thi dùng `exams`.
  lessons: {
    subtitle:
      'Tạo bài học từ mẫu bài học, soạn nội dung từng phần (tab) và publish. Teacher sửa được bài học do mình tạo, xem và nhân bản được mọi bài đã publish.',
    create: 'Tạo bài học',
    column: 'Bài học',
    empty: 'Chưa có bài học nào.',
    searchPlaceholder: 'Tìm theo tên bài học',
    allBlueprints: 'Mọi mẫu bài học',
    contentSummary: (sections: number) => `${sections} section`,
    edit: 'Soạn bài học',
    view: 'Xem bài học',
    delete: 'Xoá bài học',
    cloneConfirm: (title: string) =>
      `Nhân bản bài học ${title}? Bản sao là bài nháp mới của bạn, chép nội dung version hiện tại (media dùng chung với bài gốc), không chép lượt học.`,
    publishedNotice: (title: string) => `Đã publish bài học ${title}.`,
    archived: (title: string) => `Đã lưu trữ bài học ${title}.`,
    deleted: (title: string) => `Đã xoá bài học ${title}.`,
    archiveConfirm: (title: string) =>
      `Lưu trữ bài học ${title}? Không giao được vào giáo trình nữa; bạn vẫn sửa và publish lại được.`,
    deleteConfirm: (title: string) =>
      `Xoá bài học ${title}? Bài chưa có lượt học bị xoá hẳn; bài đã có lượt học được ẩn đi để giữ kết quả.`,
    form: {
      createTitle: 'Tạo bài học',
      editTitle: 'Thông tin bài học',
      create: 'Tạo và soạn bài học',
      save: 'Lưu thông tin',
      blueprint: 'Mẫu bài học',
      chooseBlueprint: 'Chọn mẫu bài học',
      noBlueprint:
        'Chưa có mẫu bài học đang dùng. Hãy nhờ Owner/Admin tạo mẫu bài học trước.',
      blueprintOption: (name: string, modules: number, scope: string) =>
        `${name} · ${modules} phần · ${scope}`,
      sectionsFromModules: (modules: string) =>
        `Bài học sẽ có các section: ${modules}. Sau khi tạo vẫn thêm/xoá/đổi được.`,
      blueprintChangeHint:
        'Đổi mẫu không đổi các section đang có; dùng "Thêm section → từ phần của mẫu" để thêm section của mẫu mới.',
      title: 'Tên bài học',
      titlePlaceholder: 'VD: Minna no Nihongo – Bài 1',
      visibilityHint: {
        tenant:
          'Mọi thành viên thấy bài ở trang trung tâm và học tự do (khi bài đã publish).',
        private:
          'Không hiện ở trang trung tâm; học viên chỉ học khi bài được giao qua lớp.',
      },
    },
    versionsPage: {
      subtitle:
        'Version mới chỉ được tạo khi lưu bài học mà version hiện tại đã có lượt học. Khôi phục = lưu lại nội dung version đó theo cùng quy tắc.',
      attempts: 'Lượt học',
      restoreOverwrite: (version: number, current: number) =>
        `Nội dung version ${current} (chưa có lượt học) sẽ bị ghi đè bằng nội dung version ${version}. Tiếp tục?`,
      restoreAsNew: (version: number, next: number) =>
        `Version hiện tại đã có lượt học nên sẽ tạo version ${next} với nội dung version ${version}. Tiếp tục?`,
    },
  },
  lessonEditor: {
    backToList: 'Về danh sách bài học',
    readOnlyHint:
      'Bạn chỉ xem được bài học này (Teacher chỉ sửa bài do mình tạo). Vẫn xem trước, xem các version và nhân bản bài đã publish được.',
    summary: (sections: number, questions: number) =>
      `${sections} section · ${questions} câu hỏi`,
    metadata: 'Thông tin bài học',
    published: 'Đã publish bài học.',
    archived: 'Đã lưu trữ bài học.',
    newVersionConfirm: (version: number) =>
      `Version hiện tại đã có lượt học nên lần lưu này sẽ tạo version ${version}. Lượt học cũ giữ nguyên nội dung version cũ. Tiếp tục?`,
    tabs: {
      cannotRemove: 'Bài học phải có ít nhất 1 section',
      fromModule: 'Từ phần của mẫu bài học',
    },
  },
  examEditor: {
    backToList: 'Về danh sách đề',
    version: (version: number) => `Version ${version}`,
    readOnlyBadge: 'Chỉ xem',
    readOnlyHint:
      'Bạn chỉ xem được đề này (Teacher chỉ sửa đề do mình tạo). Vẫn xem trước và xem các version được.',
    summary: (sections: number, minutes: number) =>
      `${sections} section · ${minutes} phút`,
    saving: 'Đang lưu…',
    unsaved: 'Có thay đổi chưa lưu (đã giữ bản nháp trên trình duyệt)',
    savedAt: (time: string) => `Đã lưu lúc ${time}`,
    previewButton: 'Xem trước',
    versions: 'Version',
    metadata: 'Thông tin đề',
    save: 'Lưu',
    saveShortcut: 'Lưu tất cả section (Ctrl+S)',
    saveFailed: 'Lưu thất bại',
    saveBeforePublish: 'Hãy lưu thay đổi trước khi publish',
    published: 'Đã publish đề.',
    archived: 'Đã lưu trữ đề.',
    newVersionTitle: 'Tạo version mới',
    newVersionConfirm: (version: number) =>
      `Version hiện tại đã có bài làm nên lần lưu này sẽ tạo version ${version}. Bài làm cũ giữ nguyên nội dung version cũ. Tiếp tục?`,
    newVersionSaved: (version: number) => `Đã lưu thành version ${version}.`,
    issueLine: (section: string, message: string) => `${section}: ${message}`,
    placeholder: 'Nhập nội dung section… (gõ / để chèn nhanh)',
    contentLabel: 'Nội dung section',
    stats: (words: number, chars: number) => `${words} từ · ${chars} ký tự`,
    shortcuts:
      'Ctrl+S: lưu · Ctrl+Shift+B: đánh dấu blank · bấm badge Question để đổi dạng',
    importInvalid: 'File JSON không đúng định dạng nội dung đề.',
    changeQuestionType: (label: string) => `${label} — bấm để đổi dạng`,
    correctAnswer: 'Đáp án đúng',
    restoreDraft: {
      title: 'Khôi phục bản chưa lưu',
      message: (time: string) =>
        `Trình duyệt này còn bản sửa lúc ${time} chưa lưu lên server. Khôi phục bản đó?`,
      staleNote:
        'Đề đã được lưu ở nơi khác sau khi bạn bắt đầu sửa; khôi phục rồi lưu sẽ ghi đè lần lưu đó.',
      confirm: 'Khôi phục',
      discard: 'Dùng bản trên server',
    },
    tabs: {
      label: 'Section',
      minutes: (minutes: number) => `${minutes} phút`,
      errors: (count: number) => `${count} lỗi soạn thảo`,
      duration: 'Thời lượng section',
      rename: 'Đổi tên section',
      name: 'Tên section',
      nameHint: (max: number) => `Tối đa ${max} ký tự.`,
      remove: 'Xoá section',
      cannotRemove: 'Đề phải có ít nhất 1 section',
      removeConfirm: (name: string) =>
        `Xoá section ${name} cùng toàn bộ nội dung? Có thể hoàn tác bằng cách không lưu và tải lại trang.`,
      add: 'Thêm section',
      addEmpty: 'Section trống',
      fromModule: 'Từ module của loại đề',
      maxSections: (max: number) => `Tối đa ${max} section`,
      defaultName: (index: number) => `Section ${index}`,
    },
    toolbar: {
      blockType: 'Kiểu đoạn',
      blockTypes: {
        p: 'Văn bản',
        h1: 'Tiêu đề 1',
        h2: 'Tiêu đề 2',
        h3: 'Tiêu đề 3',
        h4: 'Tiêu đề 4',
        h5: 'Tiêu đề 5',
        h6: 'Tiêu đề 6',
        blockquote: 'Trích dẫn',
        code_block: 'Khối mã',
      },
      fontSize: 'Cỡ chữ',
      bold: 'Đậm',
      italic: 'Nghiêng',
      underline: 'Gạch chân',
      strikethrough: 'Gạch ngang',
      code: 'Mã inline',
      highlight: 'Đánh dấu',
      superscript: 'Chỉ số trên',
      subscript: 'Chỉ số dưới',
      textColor: 'Màu chữ',
      backgroundColor: 'Màu nền chữ',
      removeColor: 'Bỏ màu',
      clearFormat: 'Xoá định dạng',
      bulletList: 'Danh sách chấm',
      numberedList: 'Danh sách số',
      todoList: 'Danh sách checkbox',
      orderingList: 'Danh sách đánh số tay — Ordering / Polytomous',
      pair: 'Cặp ghép — Matching / True-False / Yes-No',
      indent: 'Thụt vào',
      outdent: 'Thụt ra',
      alignLeft: 'Canh trái',
      alignCenter: 'Canh giữa',
      alignRight: 'Canh phải',
      alignJustify: 'Canh đều',
      link: 'Chèn liên kết',
      insert: 'Chèn',
      divider: 'Đường kẻ ngang',
      image: 'Hình ảnh',
      audio: 'Audio',
      video: 'Video',
      table: 'Bảng',
      insertTable: 'Chèn bảng 3×3',
      addRow: 'Thêm dòng',
      addColumn: 'Thêm cột',
      deleteRow: 'Xoá dòng',
      deleteColumn: 'Xoá cột',
      deleteTable: 'Xoá bảng',
      blank: 'Blank — ô trống (Ctrl+Shift+B)',
      indicator: 'Chèn indicator',
      undo: 'Hoàn tác',
      redo: 'Làm lại',
      exportJson: 'Xuất JSON của section',
      importJson: 'Nhập JSON vào section (thay nội dung hiện tại)',
    },
    slash: {
      ordering: 'Danh sách đánh số tay',
      pair: 'Cặp ghép',
      table: 'Bảng 3×3',
    },
    rich: {
      callout: 'Callout — Lưu ý / Ví dụ / Mẹo',
      callouts: { note: 'Lưu ý', example: 'Ví dụ', tip: 'Mẹo' },
      calloutVariant: 'Loại callout',
      toggle: 'Khối gập/mở',
      toggleHint:
        'Khối gập/mở: các dòng thụt vào bên dưới là nội dung, người học bấm tiêu đề để mở',
      ruby: 'Furigana — bôi đen chữ rồi nhập cách đọc',
      rubyTitle: 'Furigana',
      rubyLabel: 'Cách đọc',
      rubySave: 'Lưu',
      rubyHint: 'Để trống rồi lưu để gỡ furigana.',
      rubyNeedSelection: 'Bôi đen chữ cần gắn furigana trước.',
    },
    pair: {
      answer: 'Đáp án',
      chooseAnswer: '— chọn đáp án —',
      staleAnswer: (answer: string) => `${answer} (không có trong danh sách)`,
    },
    numberPopover: {
      title: { ordering: 'Thứ tự đúng', polytomous: 'Trọng số điểm' },
      markerTitle: {
        ordering: 'Thứ tự đúng — bấm để nhập',
        polytomous: 'Trọng số điểm — bấm để nhập',
      },
      hint: {
        ordering:
          'Vị trí đúng, bắt đầu từ 1 và không trùng trong cùng danh sách.',
        polytomous:
          'Trọng số điểm, số nguyên từ 0. Nhiều dòng được trùng trọng số.',
      },
      invalid: (min: number) => `Nhập số nguyên từ ${min} trở lên.`,
      taken: (value: number) =>
        `Số ${value} đã dùng ở dòng khác trong danh sách này.`,
      clear: 'Xoá số',
      save: 'Lưu',
    },
    issues: {
      title: (errors: number) => `Kiểm tra · ${errors} lỗi`,
      none: 'Không có lỗi nào. Mọi câu hỏi đã đủ dạng và đáp án.',
      section: 'Section',
      warning: 'cảnh báo',
    },
    minimap: {
      title: (count: number) => `Mini map · ${count} indicator`,
      empty:
        'Chưa có indicator nào. Dùng nút Indicator trên thanh công cụ (hoặc gõ /) để chèn.',
    },
    indicatorDialog: {
      title: 'Dạng câu hỏi',
      save: 'Lưu',
      params: {
        seconds: { label: 'Thời gian nói', unit: 'giây' },
        maxChars: { label: 'Giới hạn bài viết', unit: 'ký tự' },
        maxPicks: { label: 'Số đáp án cần chọn', unit: 'đáp án' },
      },
      numberHint: (min: number, max: number, unit: string) =>
        `Nhập số nguyên từ ${min} đến ${max} ${unit}.`,
      options: (count: number) => `Danh sách option (${count})`,
      optionsHint:
        'Mỗi dòng một option, gồm cả đáp án nhiễu. Cần ít nhất 2 option.',
      duplicatedOptions: 'Có option bị trùng.',
    },
    explanationDialog: {
      title: 'Chèn Explanation (giải thích)',
      intro:
        'Explanation là phần giải thích đáp án. Học viên không thấy nội dung này khi làm bài.',
      rules: [
        'Đặt Explanation ngay sau nội dung câu hỏi (sau danh sách lựa chọn, cặp ghép, ô trống…). Nó gắn với Question ngay phía trên.',
        'Nếu giữa câu hỏi và Explanation có Part/Subpart, hoặc phía trên không có Question nào, thì Explanation không gắn câu nào.',
        'Nội dung giải thích là mọi dòng bên dưới indicator cho tới indicator kế tiếp. Muốn viết nội dung khác sau đó, hãy chèn indicator mới (Part, Subpart hoặc Question).',
        'Một câu hỏi có thể có nhiều Explanation. Giải thích không tính vào số câu và không được chấm điểm.',
        'Khi nào hiện: bài học hiện sau khi học viên nộp phần; đề thi không bao giờ hiện cho học viên, chỉ người chấm thấy; Xem trước hiện sau khi bấm Nộp.',
      ],
      target: 'Tại vị trí con trỏ, Explanation sẽ gắn với:',
      targetNumbers: (first: number, last: number) =>
        first === last ? `Câu ${first}` : `Câu ${first}–${last}`,
      targetNone: 'Không gắn câu nào',
      insert: 'Chèn',
    },
    preview: {
      title: 'Giả lập bài làm',
      sections: 'Chọn section',
      sectionLabel: (index: number, name: string, minutes?: number) =>
        minutes === undefined
          ? `${index}. ${name}`
          : `${index}. ${name} · ${minutes} phút`,
      aside:
        'Đáp án soạn trong editor được ẩn · câu trả lời ở đây không được lưu',
    },
  },
  // Khu vực chính: đề đang mở, lịch sử lượt làm, kết quả (Step 13).
  lessonLearning: {
    heading: 'Bài học',
    searchPlaceholder: 'Tìm bài học',
    allBlueprints: 'Mọi mẫu bài học',
    noLessons: 'Trung tâm chưa có bài học nào mở cho mọi thành viên.',
    noMatch: 'Không có bài học nào khớp bộ lọc.',
    lessonStats: (sections: number, questions: number) =>
      questions > 0
        ? `${sections} phần · ${questions} câu hỏi`
        : `${sections} phần`,
    status: {
      in_progress: 'Đang học',
      completed: 'Đã học xong',
    },
    backToTenant: 'Về trang trung tâm',
    backToLesson: 'Về trang bài học',
    sectionsHeading: 'Nội dung bài học',
    theory: 'Lý thuyết',
    questions: (value: number) => `${value} câu hỏi`,
    start: 'Bắt đầu học',
    continue: 'Học tiếp',
    review: 'Xem lại',
    starting: 'Đang mở bài học…',
    startHint:
      'Học theo từng phần, không giới hạn thời gian. Phần có câu hỏi bấm "Nộp phần này" để xem đáp án và giải thích; làm lại bao nhiêu lần cũng được.',
    completeHint:
      'Bài học được tính là học xong khi bạn đã mở mọi phần và nộp mọi phần có câu hỏi.',
    closed: 'Bài học đã ngừng mở, bạn chỉ xem lại được lượt học cũ.',
    historyHeading: 'Lượt học của tôi',
    noAttempts: 'Bạn chưa học bài này.',
    version: (value: number) => `Phiên bản ${value}`,
    oldVersion: 'Phiên bản cũ · chỉ xem lại',
    progress: (
      viewed: number,
      sections: number,
      submitted: number,
      total: number,
    ) =>
      total > 0
        ? `Đã mở ${viewed}/${sections} phần · đã nộp ${submitted}/${total} phần bài tập`
        : `Đã mở ${viewed}/${sections} phần`,
    autoScore: (correct: number, total: number) =>
      `Đúng ${correct}/${total} câu`,
    manualProgress: (graded: number, total: number) =>
      `Đã chấm ${graded}/${total} câu tự luận`,
    readOnly:
      'Lượt học này chỉ còn xem lại: bài học đã có phiên bản mới hoặc không còn mở.',
    completedBanner: 'Bạn đã học xong bài này. Vẫn có thể làm lại bài tập.',
    submitSection: 'Nộp phần này',
    submitting: 'Đang nộp…',
    confirmSubmit: 'Nộp phần này? Bạn sẽ thấy đáp án và có thể làm lại sau.',
    unanswered: (count: number) => `Còn ${count} câu chưa làm — vẫn nộp?`,
    retry: 'Làm lại',
    retrying: 'Đang mở lại…',
    viewPrevious: 'Xem kết quả lần trước',
    backToDraft: 'Quay lại làm bài',
    previousHint: 'Kết quả lần nộp trước, sẽ được thay khi bạn nộp lần mới.',
    submittedAt: (value: string) => `Nộp lúc ${value}`,
    submitCount: (count: number) => `Đã nộp ${count} lần`,
    resultSummary: (correct: number, total: number) =>
      `Đúng ${correct}/${total} câu`,
    manualPending: (count: number) => `${count} câu chờ giáo viên chấm`,
    manualDone: (graded: number, total: number) =>
      `Đã chấm ${graded}/${total} câu tự luận`,
    noSubmitNeeded: 'Phần này không có câu hỏi, chỉ cần đọc.',
    listenSubmitted: 'Nghe lại bài nói',
    noRecording: 'Không có ghi âm.',
    saveState: {
      saved: 'Đã lưu',
      dirty: 'Chưa lưu',
      saving: 'Đang lưu…',
      error: 'Lưu thất bại, đang thử lại',
    },
    previewTitle: 'Xem trước bài học',
    previewAside: 'Xem trước · chấm ngay trên trình duyệt, không lưu',
  },
  learner: {
    searchPlaceholder: 'Tìm đề thi',
    allCategories: 'Mọi danh mục',
    allBlueprints: 'Mọi loại đề',
    noMatch: 'Không có đề nào khớp bộ lọc.',
    examStats: (sections: number, questions: number, minutes: number) =>
      `${sections} section · ${questions} câu · ${minutes} phút`,
    recentAttempts: 'Lượt làm gần đây',
    viewExam: 'Xem đề',
    backToTenant: 'Về trang trung tâm',
    sectionsHeading: 'Cấu trúc đề',
    sectionColumns: {
      section: 'Section',
      duration: 'Thời gian',
      questions: 'Số câu',
    },
    minutes: (value: number) => `${value} phút`,
    questions: (value: number) => `${value} câu`,
    totalDuration: (value: number) => `Tổng thời gian ${value} phút`,
    start: 'Bắt đầu làm bài',
    continue: 'Làm tiếp',
    starting: 'Đang tạo lượt làm…',
    startHint:
      'Mỗi section có đồng hồ riêng, chỉ bắt đầu tính giờ khi bạn bấm Bắt đầu ở màn hình hướng dẫn của section đó.',
    inProgressHint:
      'Bạn đang có lượt làm dở. Hãy làm tiếp hoặc nộp bài trước khi bắt đầu lượt mới.',
    closed: 'Đề đã ngừng mở, bạn chỉ xem được lịch sử lượt làm.',
    historyHeading: 'Lịch sử lượt làm',
    noAttempts: 'Bạn chưa làm đề này lần nào.',
    attemptColumns: {
      exam: 'Đề thi',
      startedAt: 'Bắt đầu',
      status: 'Trạng thái',
      score: 'Số câu đúng',
      actions: 'Thao tác',
    },
    attemptStatus: {
      in_progress: 'Đang làm',
      submitted: 'Chờ chấm',
      graded: 'Đã có kết quả',
    },
    sectionProgress: (done: number, total: number) =>
      `Đã nộp ${done}/${total} section`,
    score: (correct: number, total: number) => `${correct}/${total}`,
    viewResult: 'Xem kết quả',
    resultTitle: 'Kết quả bài làm',
    startedAt: (value: string) => `Bắt đầu ${value}`,
    submittedAt: (value: string) => `Nộp ${value}`,
    autoTotal: 'Câu chấm tự động đúng',
    manualProgress: (graded: number, total: number) =>
      `Đã chấm ${graded}/${total} câu tự luận`,
    noManual: 'Không có câu chấm tay',
    resultNote:
      'Kết quả chỉ hiện số câu đúng, không hiện đáp án. Câu Writing/Speaking do giáo viên chấm.',
    autoSubmitted: 'Hết giờ, tự nộp',
    manualHeading: 'Phần chấm tay',
    manualItem: (no: number, qtype: string) => `Câu ${no} · ${qtype}`,
    waitingGrade: 'Chờ chấm',
    manualScore: (score: number, max: number) => `${score}/${max} điểm`,
    manualTotal: (score: number, max: number) =>
      `Tổng điểm tự luận ${score}/${max}`,
    qtypes: { writing: 'Writing', speaking: 'Speaking' } as Record<
      string,
      string
    >,
  },
  // Trang thi toàn màn hình.
  examTaking: {
    loadFailed: 'Không tải được bài làm',
    sectionOf: (index: number, total: number) => `Section ${index}/${total}`,
    sectionInfo: (minutes: number, questions: number) =>
      `${minutes} phút · ${questions} câu`,
    startSection: 'Bắt đầu section',
    starting: 'Đang bắt đầu…',
    startHint:
      'Đồng hồ bắt đầu chạy khi bấm Bắt đầu. Hết giờ, bài được tự động nộp. Tải lại trang không làm mất câu trả lời đã lưu.',
    noIntro: 'Section này không có phần hướng dẫn.',
    justSubmitted: (name: string) => `Đã nộp section "${name}".`,
    justAutoSubmitted: (name: string) =>
      `Hết giờ, section "${name}" đã được tự động nộp.`,
    sectionStatus: {
      not_started: 'Chưa làm',
      in_progress: 'Đang làm',
      submitted: 'Đã nộp',
    },
    finish: 'Nộp toàn bài',
    finishTitle: 'Nộp toàn bài?',
    finishMessage: (remaining: number) =>
      `Còn ${remaining} section chưa làm sẽ được tính là bỏ trống. Nộp rồi không làm tiếp được nữa.`,
    timeLeft: 'Thời gian còn lại',
    saveState: {
      saved: 'Đã lưu',
      dirty: 'Chưa lưu',
      saving: 'Đang lưu…',
      error: 'Lưu thất bại, đang thử lại',
    },
    submitting: 'Đang nộp section…',
    timeUp: 'Hết giờ — đang nộp bài…',
    submitFailed: 'Nộp section thất bại',
    finished: 'Bạn đã nộp bài. Đang chuyển tới trang kết quả…',
    exit: 'Thoát',
    recorder: {
      unsupported:
        'Trình duyệt không cho ghi âm trên trang này (cần HTTPS hoặc localhost, và trình duyệt hỗ trợ MediaRecorder).',
      permissionDenied:
        'Không truy cập được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.',
      record: 'Ghi âm',
      rerecord: 'Ghi lại',
      stop: 'Dừng',
      recording: (elapsed: number, max?: number) =>
        `Đang ghi ${elapsed}s${max !== undefined ? ` / ${max}s` : ''}`,
      limit: (seconds?: number) =>
        seconds !== undefined
          ? `Ghi âm tối đa ${seconds} giây, được ghi lại trong thời gian làm section.`
          : 'Được ghi lại trong thời gian làm section.',
      uploading: 'Đang tải bản ghi lên…',
      uploaded: (time: string) => `Đã lưu bản ghi lúc ${time}`,
      uploadFailed: 'Tải bản ghi lên thất bại',
      play: 'Nghe lại',
      retryUpload: 'Tải lại lên',
    },
  },
  // Bản giả lập đề: xem trước trong dashboard và trang thi.
  grading: {
    subtitle:
      'Chấm các câu Writing/Speaking của bài đã nộp. Không chấm được bài của chính mình; phần chấm tự động giữ nguyên.',
    lessonSubtitle:
      'Chấm các câu Writing/Speaking trong bài tập của bài học. Chỉ chấm lần nộp gần nhất: học viên nộp lại thì điểm cũ bị bỏ và cần chấm lại.',
    kinds: { exam: 'Đề thi', lesson: 'Bài học' },
    searchPlaceholder: 'Tìm theo tên hoặc email học viên',
    allStatuses: 'Mọi trạng thái',
    allExams: 'Mọi đề thi',
    allLessons: 'Mọi bài học',
    status: { submitted: 'Chờ chấm', graded: 'Đã chấm' },
    columns: {
      student: 'Học viên',
      exam: 'Đề thi',
      lesson: 'Bài học',
      submittedAt: 'Nộp lúc',
      progress: 'Chấm tay',
      status: 'Trạng thái',
    },
    empty: 'Không có bài nào khớp bộ lọc.',
    open: 'Chấm bài',
    view: 'Xem bài',
    progress: (graded: number, total: number) => `${graded}/${total} câu`,
    autoScore: (correct: number, total: number) =>
      `Tự động đúng ${correct}/${total}`,
    backToList: 'Danh sách bài',
    submittedAt: (value: string) => `Nộp ${value}`,
    questionsHeading: 'Câu cần chấm',
    questionLabel: (no: number, qtype: string) => `Câu ${no} · ${qtype}`,
    partLabel: (section: string, part: number | null) =>
      part === null ? section : `${section} · Part ${part + 1}`,
    autoSubmitted: 'Hết giờ, tự nộp',
    passage: 'Nội dung part',
    prompt: 'Đề bài',
    explanations: 'Giải thích (học viên không thấy)',
    lessonExplanations: 'Giải thích (học viên thấy sau khi nộp)',
    response: 'Bài làm',
    blank: 'Học viên bỏ trống câu này.',
    noRecording: 'Học viên không ghi âm câu này.',
    loadRecording: 'Tải ghi âm',
    recordingFailed: 'Không tải được ghi âm',
    charCount: (chars: number, words: number, max: number | null) =>
      `${chars}${max ? `/${max}` : ''} ký tự · ${words} từ`,
    maxSeconds: (seconds: number) => `Ghi tối đa ${seconds} giây`,
    score: 'Điểm',
    scoreHint: (max: number) => `0–${max}, bước 0,5`,
    comment: 'Nhận xét',
    commentPlaceholder: 'Nhận xét cho học viên (không bắt buộc)',
    save: 'Lưu điểm',
    saveAndNext: 'Lưu & câu tiếp',
    zero: 'Cho 0 điểm',
    saved: 'Đã lưu điểm',
    unsaved: 'Chưa lưu',
    invalidScore: (max: number) => `Điểm phải từ 0 đến ${max}, bước 0,5`,
    waiting: 'Chờ chấm',
    scoreBadge: (score: number, max: number) => `${score}/${max}`,
    gradedBy: (name: string, at: string) => `Chấm bởi ${name} · ${at}`,
    gradedByUnknown: (at: string) => `Đã chấm · ${at}`,
    allGraded: 'Đã chấm đủ mọi câu của bài này. Học viên đã xem được điểm.',
    nextAttempt: 'Bài chờ chấm tiếp theo',
  },
  simulator: {
    status: {
      todo: 'Chưa làm',
      flagged: 'Gắn cờ',
      answered: 'Đã trả lời',
      correct: 'Đúng',
      wrong: 'Sai',
      manual: 'Không chấm tự động',
    },
    badgeResult: (label: string, status: string) => `Câu ${label} — ${status}`,
    badgeFlag: (label: string, flagged: boolean) =>
      `Câu ${label} — bấm để ${flagged ? 'gỡ' : 'gắn'} cờ`,
    correctSummary: (manual: number) =>
      manual > 0 ? `câu đúng · ${manual} câu không chấm tự động` : 'câu đúng',
    reviewHint: 'Bấm số để xem lại từng câu',
    retry: 'Làm lại',
    unanswered: (count: number) => `Còn ${count} câu chưa làm — vẫn nộp?`,
    keepGoing: 'Làm tiếp',
    submitAnyway: 'Vẫn nộp',
    progress: (done: number, total: number) =>
      `Đã trả lời ${done}/${total} · bấm số trong đề để gắn cờ`,
    submit: 'Nộp bài',
    submitSection: 'Nộp section',
    confirmSubmit: 'Nộp section này? Nộp rồi không sửa được nữa.',
    question: (no: number) => `Câu ${no}`,
    questionRange: (first: number, last: number) =>
      first === last ? `Câu ${first}` : `Câu ${first}–${last}`,
    blank: 'Ô trống',
    choice: 'Lựa chọn',
    answer: 'Câu trả lời',
    choose: '— chọn —',
    pickHint: (max: number, picked: number) =>
      `Chọn ${max} đáp án · đã chọn ${picked}/${max}`,
    moveUp: 'Lên',
    moveDown: 'Xuống',
    speaking: (seconds?: number) =>
      `Phần nói${seconds !== undefined ? ` — ${seconds} giây` : ''}. Bản xem trước chưa ghi âm.`,
    charCount: (count: number, max?: number) =>
      `${count}${max !== undefined ? ` / ${max}` : ''} ký tự`,
    explanation: 'Giải thích',
    callouts: { note: 'Lưu ý', example: 'Ví dụ', tip: 'Mẹo' },
    correctAnswer: 'Đáp án đúng',
    correctOrder: 'Thứ tự đúng',
    awaitingGrading: 'Chờ giáo viên chấm',
    manualScore: (score: number, max: number) =>
      `Điểm: ${String(score).replace('.', ',')}/${max}`,
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
  // Tài liệu nội bộ `/user-manual` (req-2), chỉ System Owner/Admin.
  userManual: {
    title: 'Tài liệu nội bộ',
    backToAdmin: 'Quản trị hệ thống',
    searchPlaceholder: 'Tìm trong tài liệu…',
    allRoles: 'Mọi vai trò',
    resultCount: (count: number) => `${count} trang khớp`,
    noResults: 'Không có trang nào khớp.',
    clearFilters: 'Bỏ lọc',
    toc: 'Trong trang này',
    previous: 'Trang trước',
    next: 'Trang sau',
    appliesTo: 'Áp dụng cho',
    updatedAt: (date: string) => `Cập nhật ${date}`,
    loadFailed: 'Không tải được tài liệu',
    pageNotFound: 'Không tìm thấy trang tài liệu',
    pageNotFoundText: 'Trang này không tồn tại hoặc đã đổi tên.',
    openFirstPage: 'Về trang đầu',
    callout: { info: 'Thông tin', tip: 'Mẹo', warning: 'Lưu ý' },
  },
  nav: {
    overview: 'Tổng quan',
    users: 'Người dùng',
    tenants: 'Trung tâm',
    plans: 'Gói dịch vụ',
    members: 'Thành viên',
    categories: 'Danh mục',
    examBlueprints: 'Loại đề',
    lessonBlueprints: 'Mẫu bài học',
    exams: 'Đề thi',
    lessons: 'Bài học',
    media: 'Thư viện media',
    grading: 'Chấm bài',
    userManual: 'Tài liệu nội bộ',
    sectionManagement: 'Quản lý',
    sectionExam: 'Đề thi & Bài học',
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
