import {
  ForbiddenException,
  NotFoundException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  MembershipStatus,
  SystemRole,
  TENANT_MANAGER_ROLES,
  TenantRole,
  TenantStatus,
} from '@lang/shared';
import type { MembershipRole } from '../memberships/membership-role.entity';
import type { Membership } from '../memberships/membership.entity';
import { InMemoryRepository } from '../testing/in-memory-repository';
import { TenantRoles, type TenantRequest } from './tenant-context';
import type { Tenant } from './tenant.entity';
import { TenantGuard } from './tenant.guard';

class MembersController {
  @TenantRoles(...TENANT_MANAGER_ROLES)
  manage() {}

  view() {}
}

function setup(status: TenantStatus = TenantStatus.ACTIVE) {
  const tenants = new InMemoryRepository<Tenant>();
  const memberships = new InMemoryRepository<Membership>(() => ({
    deletedAt: null,
  }));
  const membershipRoles = new InMemoryRepository<MembershipRole>(undefined, [
    'membershipId',
    'role',
  ]);
  const guard = new TenantGuard(
    new Reflector(),
    tenants.asRepository(),
    memberships.asRepository(),
    membershipRoles.asRepository(),
  );
  void tenants.save(
    tenants.create({ id: 't1', slug: 'a-chau', name: 'Á Châu', status }),
  );

  async function addMember(
    userId: string,
    roles: TenantRole[],
    memberStatus: MembershipStatus = MembershipStatus.ACTIVE,
  ) {
    const membership = await memberships.save(
      memberships.create({ tenantId: 't1', userId, status: memberStatus }),
    );
    await membershipRoles.insert(
      roles.map((role) => ({
        membershipId: membership.id,
        tenantId: 't1',
        role,
      })),
    );
    return membership;
  }

  function run(
    userId: string,
    handler: keyof MembersController = 'view',
    slug = 'a-chau',
  ) {
    const request = {
      params: { slug },
      user: {
        id: userId,
        email: `${userId}@example.com`,
        systemRole: SystemRole.REGISTERED_USER,
      },
    } as unknown as TenantRequest;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => MembersController.prototype[handler],
      getClass: () => MembersController,
    } as unknown as ExecutionContext;
    return { request, result: guard.canActivate(context) };
  }

  return { addMember, run };
}

describe('TenantGuard', () => {
  it('tenant pending: Owner cũng bị chặn', async () => {
    const { addMember, run } = setup(TenantStatus.PENDING);
    await addMember('owner', [TenantRole.TENANT_OWNER]);

    await expect(run('owner', 'manage').result).rejects.toThrow(
      new ForbiddenException('Trung tâm đang chờ duyệt'),
    );
  });

  it('người ngoài: tenant chưa hoạt động → 404, tenant active → 403', async () => {
    await expect(
      setup(TenantStatus.PENDING).run('outsider').result,
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      setup(TenantStatus.ACTIVE).run('outsider').result,
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('slug không tồn tại → 404', async () => {
    const { run } = setup();
    await expect(
      run('owner', 'view', 'khong-co').result,
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('membership inactive coi như không phải thành viên', async () => {
    const { addMember, run } = setup();
    await addMember('student', [TenantRole.STUDENT], MembershipStatus.INACTIVE);

    await expect(run('student').result).rejects.toThrow(
      new ForbiddenException('Bạn không phải thành viên của trung tâm này'),
    );
  });

  it('@TenantRoles: Student bị chặn, Tenant Admin qua và có tenantCtx', async () => {
    const { addMember, run } = setup();
    await addMember('student', [TenantRole.STUDENT]);
    const admin = await addMember('admin', [
      TenantRole.TENANT_ADMIN,
      TenantRole.TEACHER,
    ]);

    await expect(run('student', 'manage').result).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(run('student', 'view').result).resolves.toBe(true);

    const { request, result } = run('admin', 'manage');
    await expect(result).resolves.toBe(true);
    expect(request.tenantCtx).toEqual({
      tenantId: 't1',
      slug: 'a-chau',
      name: 'Á Châu',
      status: TenantStatus.ACTIVE,
      membershipId: admin.id,
      roles: [TenantRole.TENANT_ADMIN, TenantRole.TEACHER],
    });
  });
});
