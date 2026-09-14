export const UserStatus = {
  ACTIVE: 'active',
  LOCKED: 'locked',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** `pending` chờ System Admin duyệt; `rejected` được sửa và gửi lại. */
export const TenantStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export const MembershipStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;
export type MembershipStatus =
  (typeof MembershipStatus)[keyof typeof MembershipStatus];
