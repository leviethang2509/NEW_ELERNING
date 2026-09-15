import { SystemRole } from './roles';
import type { TenantStatus, UserStatus } from './status';
import type { ServicePlanSummary } from './tenant';
import type { Gender } from './user';

/** Mã gói: chữ thường không dấu, số, `-`/`_` ở giữa. Không đổi được sau khi tạo. */
export const SERVICE_PLAN_CODE_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
export const SERVICE_PLAN_CODE_MAX_LENGTH = 32;

/**
 * System Admin chỉ thao tác trên Registered User; tài khoản System Admin/Owner
 * chỉ System Owner được sửa, khoá, reset mật khẩu.
 */
export function canManageUser(
  actorRole: SystemRole,
  targetRole: SystemRole,
): boolean {
  return (
    actorRole === SystemRole.SYSTEM_OWNER ||
    targetRole === SystemRole.REGISTERED_USER
  );
}

/** `GET /admin/stats`. */
export interface AdminStats {
  users: { total: number; newLast7Days: number; locked: number };
  tenants: { total: number; byStatus: Record<TenantStatus, number> };
}

/** Người dùng trong trang quản trị hệ thống. */
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  /** `YYYY-MM-DD` */
  dateOfBirth: string;
  gender: Gender | null;
  phone: string | null;
  address: string | null;
  systemRole: SystemRole;
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Tạo user / reset mật khẩu. */
export interface AdminUserPasswordResult {
  user: AdminUser;
  /** Mật khẩu tạm do hệ thống sinh, chỉ trả về một lần; `null` khi admin tự nhập. */
  temporaryPassword: string | null;
}

/** Tenant trong trang quản trị hệ thống (danh sách và chi tiết). */
export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: TenantStatus;
  rejectionReason: string | null;
  suspensionReason: string | null;
  plan: ServicePlanSummary;
  owner: { id: string; email: string; fullName: string };
  /** Membership active; có thể lớn hơn `plan.maxMembers` sau khi hạ gói. */
  activeMembers: number;
  createdAt: string;
  /** Lần duyệt / từ chối / khoá / mở khoá gần nhất. */
  reviewedAt: string | null;
  reviewer: { id: string; email: string; fullName: string } | null;
}

export interface AdminServicePlan extends ServicePlanSummary {
  isActive: boolean;
  sortOrder: number;
  /** Số tenant (chưa xoá) đang dùng gói. */
  tenantCount: number;
}
