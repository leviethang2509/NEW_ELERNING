/** Role hệ thống: mỗi user có đúng 1 giá trị (cột `users.system_role`). */
export const SystemRole = {
  SYSTEM_OWNER: 'SYSTEM_OWNER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  REGISTERED_USER: 'REGISTERED_USER',
} as const;
export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

/** Role trong tenant: một membership có thể mang nhiều role (`membership_roles`). */
export const TenantRole = {
  TENANT_OWNER: 'TENANT_OWNER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
} as const;
export type TenantRole = (typeof TenantRole)[keyof typeof TenantRole];

/** Được vào dashboard `/admin`. */
export const SYSTEM_MANAGER_ROLES: readonly SystemRole[] = [
  SystemRole.SYSTEM_OWNER,
  SystemRole.SYSTEM_ADMIN,
];

/** Quản lý membership, danh mục/loại đề riêng của tenant, sửa mọi đề. */
export const TENANT_MANAGER_ROLES: readonly TenantRole[] = [
  TenantRole.TENANT_OWNER,
  TenantRole.TENANT_ADMIN,
];

/** Được tạo đề và upload media đề. Teacher chỉ sửa/publish đề do mình tạo. */
export const EXAM_AUTHOR_ROLES: readonly TenantRole[] = [
  TenantRole.TENANT_OWNER,
  TenantRole.TENANT_ADMIN,
  TenantRole.TEACHER,
];

/** Được chấm bài Writing/Speaking (trừ bài của chính mình). */
export const GRADER_ROLES: readonly TenantRole[] = EXAM_AUTHOR_ROLES;

/** Được vào dashboard tenant. Student/Parent chỉ dùng khu vực chính. */
export const TENANT_DASHBOARD_ROLES: readonly TenantRole[] = EXAM_AUTHOR_ROLES;

export function hasAnyRole<T extends string>(
  roles: readonly T[],
  allowed: readonly T[],
): boolean {
  return roles.some((role) => allowed.includes(role));
}
