import {
  EXAM_AUTHOR_ROLES,
  TENANT_DASHBOARD_ROLES,
  TenantRole,
  hasAnyRole,
} from './roles';

describe('hasAnyRole', () => {
  it('đúng khi có ít nhất một role được phép', () => {
    expect(
      hasAnyRole([TenantRole.STUDENT, TenantRole.TEACHER], EXAM_AUTHOR_ROLES),
    ).toBe(true);
  });

  it('Student/Parent không vào được dashboard tenant', () => {
    expect(
      hasAnyRole(
        [TenantRole.STUDENT, TenantRole.PARENT],
        TENANT_DASHBOARD_ROLES,
      ),
    ).toBe(false);
  });
});
