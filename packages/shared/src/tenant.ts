import type { ExamStatus } from './exam';
import type { SystemRole, TenantRole } from './roles';
import type { MembershipStatus, TenantStatus } from './status';

export const TENANT_SLUG_MIN_LENGTH = 3;
export const TENANT_SLUG_MAX_LENGTH = 40;

/** Chữ thường không dấu và số, gạch nối đơn ở giữa (không đầu/cuối, không `--`). */
export const TENANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug trùng route hoặc từ khoá hệ thống, tenant không được dùng. */
export const RESERVED_TENANT_SLUGS: readonly string[] = [
  'about',
  'admin',
  'api',
  'app',
  'auth',
  'blog',
  'contact',
  'dashboard',
  'docs',
  'edit',
  'help',
  'lang-simulator',
  'login',
  'logout',
  'mail',
  'new',
  'null',
  'public',
  'register',
  'root',
  'settings',
  'static',
  'status',
  'support',
  'system',
  'tenant',
  'tenants',
  'undefined',
  'www',
];

export type TenantSlugError = 'length' | 'format' | 'reserved';

/** `null` khi slug hợp lệ (chưa kiểm tra trùng). */
export function validateTenantSlug(slug: string): TenantSlugError | null {
  if (
    slug.length < TENANT_SLUG_MIN_LENGTH ||
    slug.length > TENANT_SLUG_MAX_LENGTH
  ) {
    return 'length';
  }
  if (!TENANT_SLUG_PATTERN.test(slug)) return 'format';
  if (RESERVED_TENANT_SLUGS.includes(slug)) return 'reserved';
  return null;
}

/**
 * Chuyển tên sang dạng slug: bỏ dấu tiếng Việt, ký tự khác chữ/số thành `-`.
 * Kết quả có thể ngắn hơn giới hạn tối thiểu hoặc rỗng (tên toàn ký tự không phải Latin).
 */
export function slugifyTenantName(
  name: string,
  maxLength = TENANT_SLUG_MAX_LENGTH,
): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, maxLength)
    .replace(/-+$/, '');
}

/** Gói dịch vụ hiển thị cho người đăng ký tenant. */
export interface ServicePlanSummary {
  id: string;
  code: string;
  name: string;
  maxMembers: number;
  /** Cột `numeric`, giữ dạng chuỗi để không mất chính xác. */
  price: string | null;
  description: string | null;
}

/** Thông tin giới thiệu công khai của tenant đang hoạt động (`GET /public/tenants/:slug`). */
export interface PublicTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

/** Tenant do chính user đăng ký (`GET /tenants/mine`, đăng ký, sửa & gửi lại). */
export interface OwnedTenant extends PublicTenant {
  status: TenantStatus;
  rejectionReason: string | null;
  /** Chỉ chủ trung tâm thấy lý do tạm khoá. */
  suspensionReason: string | null;
  plan: ServicePlanSummary;
  createdAt: string;
  reviewedAt: string | null;
}

/** Một ngữ cảnh tenant của user (membership đang active). */
export interface MeTenantContext {
  membershipId: string;
  roles: TenantRole[];
  joinedAt: string;
  tenant: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    status: TenantStatus;
    rejectionReason: string | null;
  };
}

/** `GET /me/contexts`: role hệ thống và các tenant user là thành viên. */
export interface MeContexts {
  systemRole: SystemRole;
  tenants: MeTenantContext[];
}

/** Dòng trong danh sách thành viên tenant. */
export interface MembershipListItem {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  /** `YYYY-MM-DD`, để hiển thị badge "< 18 tuổi". */
  dateOfBirth: string;
  status: MembershipStatus;
  roles: TenantRole[];
  joinedAt: string;
  /** Lần gần nhất vào tenant (cập nhật tối đa 1 lần/giờ); `null` là chưa từng vào. */
  lastActiveAt: string | null;
}

/** `GET /t/:slug/me`: tenant đang hoạt động và membership của user hiện tại. */
export interface TenantMembershipInfo {
  tenant: PublicTenant;
  membershipId: string;
  roles: TenantRole[];
}

/** Số thành viên active so với giới hạn gói; `excess` > 0 khi đang vượt (sau hạ gói). */
export interface MemberQuota {
  planName: string;
  maxMembers: number;
  activeMembers: number;
  excess: number;
}

/** `GET /t/:slug/memberships/deactivation-suggestions`. */
export interface DeactivationSuggestions extends MemberQuota {
  /** Tối đa `excess` thành viên, chưa từng vào trước rồi tới lần vào cũ nhất. */
  items: MembershipListItem[];
}

/** `GET /t/:slug/dashboard/stats`. Teacher chỉ có bản rút gọn (`management = null`). */
export interface TenantDashboardStats {
  students: number;
  exams: Record<ExamStatus, number>;
  attempts: number;
  pendingGrading: number;
  management: {
    teachers: number;
    parents: number;
    quota: MemberQuota;
  } | null;
}

/** Liên kết Phụ huynh ↔ Học viên, nhìn từ một phía. */
export interface GuardianLink {
  id: string;
  relationship: string | null;
  /** Thành viên ở phía bên kia liên kết. */
  member: { membershipId: string; fullName: string; email: string };
}

export interface MembershipDetail extends MembershipListItem {
  /** Phụ huynh của thành viên này (khi là Học viên). */
  guardians: GuardianLink[];
  /** Học viên mà thành viên này là phụ huynh. */
  wards: GuardianLink[];
}

export interface CreateMemberAccountResult {
  membership: MembershipListItem;
  /** Mật khẩu tạm do hệ thống sinh, chỉ trả về một lần; `null` khi admin tự nhập. */
  temporaryPassword: string | null;
}
