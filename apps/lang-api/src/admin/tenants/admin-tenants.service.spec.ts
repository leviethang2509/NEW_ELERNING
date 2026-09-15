import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  MembershipStatus,
  SystemRole,
  TenantRole,
  TenantStatus,
} from '@lang/shared';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import type { MembershipRole } from '../../memberships/membership-role.entity';
import type { Membership } from '../../memberships/membership.entity';
import type { ServicePlan } from '../../plans/service-plan.entity';
import type { TenantRequest } from '../../tenants/tenant-context';
import type { Tenant } from '../../tenants/tenant.entity';
import { TenantGuard } from '../../tenants/tenant.guard';
import { InMemoryRepository } from '../../testing/in-memory-repository';
import { AdminTenantsService } from './admin-tenants.service';

const actor: RequestUser = {
  id: 'system-admin',
  email: 'admin@example.com',
  systemRole: SystemRole.SYSTEM_ADMIN,
};

function setup() {
  const tenants = new InMemoryRepository<Tenant>(() => ({
    rejectionReason: null,
    suspensionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    deletedAt: null,
  }));
  const memberships = new InMemoryRepository<Membership>(() => ({
    deletedAt: null,
  }));
  const membershipRoles = new InMemoryRepository<MembershipRole>(undefined, [
    'membershipId',
    'role',
  ]);
  const plans = new InMemoryRepository<ServicePlan>();
  const service = new AdminTenantsService(
    tenants.asRepository(),
    memberships.asRepository(),
    plans.asRepository(),
  );

  let counter = 0;
  const addTenant = (status: TenantStatus) => {
    counter += 1;
    return tenants.save(
      tenants.create({
        slug: `trung-tam-${counter}`,
        name: `Trung tâm ${counter}`,
        status,
        planId: 'plan-basic',
        ownerUserId: 'owner',
      }),
    );
  };
  const row = (id: string) => tenants.rows.find((item) => item.id === id);

  return {
    service,
    tenants,
    memberships,
    membershipRoles,
    plans,
    addTenant,
    row,
  };
}

describe('AdminTenantsService', () => {
  it('duyệt / từ chối chỉ từ pending và ghi người xử lý', async () => {
    const { service, addTenant, row } = setup();
    const pending = await addTenant(TenantStatus.PENDING);

    await service.approve(actor, pending.id);
    expect(row(pending.id)).toMatchObject({
      status: TenantStatus.ACTIVE,
      reviewedBy: actor.id,
    });
    expect(row(pending.id)?.reviewedAt).toBeInstanceOf(Date);

    await expect(service.approve(actor, pending.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(
      service.reject(actor, pending.id, 'Muộn'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('từ chối lưu lý do; tạm khoá chỉ từ active; mở khoá xoá lý do tạm khoá', async () => {
    const { service, addTenant, row } = setup();
    const pending = await addTenant(TenantStatus.PENDING);
    const active = await addTenant(TenantStatus.ACTIVE);

    await service.reject(actor, pending.id, 'Thiếu thông tin liên hệ');
    expect(row(pending.id)).toMatchObject({
      status: TenantStatus.REJECTED,
      rejectionReason: 'Thiếu thông tin liên hệ',
    });
    await expect(
      service.suspend(actor, pending.id, 'Vi phạm'),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(service.approve(actor, pending.id)).rejects.toBeInstanceOf(
      ConflictException,
    );

    await service.suspend(actor, active.id, 'Vi phạm điều khoản');
    expect(row(active.id)).toMatchObject({
      status: TenantStatus.SUSPENDED,
      suspensionReason: 'Vi phạm điều khoản',
    });
    await service.unsuspend(actor, active.id);
    expect(row(active.id)).toMatchObject({
      status: TenantStatus.ACTIVE,
      suspensionReason: null,
    });
    await expect(service.unsuspend(actor, active.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('tenant không tồn tại → 404', async () => {
    const { service } = setup();
    await expect(service.approve(actor, 'khong-co')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('duyệt xong thì Tenant Owner qua được TenantGuard', async () => {
    const { service, tenants, memberships, membershipRoles, addTenant } =
      setup();
    const tenant = await addTenant(TenantStatus.PENDING);
    const membership = await memberships.save(
      memberships.create({
        tenantId: tenant.id,
        userId: 'owner',
        status: MembershipStatus.ACTIVE,
      }),
    );
    await membershipRoles.insert({
      membershipId: membership.id,
      tenantId: tenant.id,
      role: TenantRole.TENANT_OWNER,
    });
    const guard = new TenantGuard(
      new Reflector(),
      tenants.asRepository(),
      memberships.asRepository(),
      membershipRoles.asRepository(),
    );
    const context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            params: { slug: tenant.slug },
            user: {
              id: 'owner',
              email: 'owner@example.com',
              systemRole: SystemRole.REGISTERED_USER,
            },
          }) as unknown as TenantRequest,
      }),
      getHandler: () => () => undefined,
      getClass: () => Object,
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await service.approve(actor, tenant.id);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('đổi gói chỉ chọn gói đang áp dụng, có hiệu lực ngay dù vượt giới hạn', async () => {
    const { service, plans, addTenant, row } = setup();
    const tenant = await addTenant(TenantStatus.ACTIVE);
    const retired = await plans.save(
      plans.create({ code: 'cu', name: 'Cũ', maxMembers: 50, isActive: false }),
    );
    const tiny = await plans.save(
      plans.create({ code: 'nho', name: 'Nhỏ', maxMembers: 1, isActive: true }),
    );

    await expect(
      service.changePlan(tenant.id, retired.id),
    ).rejects.toBeInstanceOf(BadRequestException);
    await service.changePlan(tenant.id, tiny.id);
    expect(row(tenant.id)?.planId).toBe(tiny.id);
  });
});
