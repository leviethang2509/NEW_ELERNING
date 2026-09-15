import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExamStatus,
  MembershipStatus,
  TENANT_MANAGER_ROLES,
  TenantRole,
  hasAnyRole,
  type TenantDashboardStats,
} from '@lang/shared';
import type { Repository } from 'typeorm';
import { MembershipRole } from '../memberships/membership-role.entity';
import { Membership } from '../memberships/membership.entity';
import { MembershipsService } from '../memberships/memberships.service';
import type { TenantContext } from '../tenants/tenant-context';

@Injectable()
export class TenantDashboardService {
  constructor(
    @InjectRepository(MembershipRole)
    private readonly membershipRoles: Repository<MembershipRole>,
    private readonly memberships: MembershipsService,
  ) {}

  /**
   * Tổng quan tenant. Teacher chỉ có bản rút gọn (học viên, đề, lượt làm, bài
   * chờ chấm); số liệu thành viên và gói chỉ cho Owner/Admin.
   */
  async getStats(ctx: TenantContext): Promise<TenantDashboardStats> {
    const rows = await this.membershipRoles
      .createQueryBuilder('r')
      .innerJoin(Membership, 'm', 'm.id = r.membershipId')
      .select('r.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('r.tenantId = :tenantId', { tenantId: ctx.tenantId })
      .andWhere('m.status = :status', { status: MembershipStatus.ACTIVE })
      .andWhere('m.deletedAt IS NULL')
      .groupBy('r.role')
      .getRawMany<{ role: TenantRole; count: string }>();
    const byRole = new Map(rows.map((row) => [row.role, Number(row.count)]));
    const count = (role: TenantRole) => byRole.get(role) ?? 0;

    const isManager = hasAnyRole(ctx.roles, TENANT_MANAGER_ROLES);
    return {
      students: count(TenantRole.STUDENT),
      // Đề thi, lượt làm và chấm bài có ở Step 12–14.
      exams: Object.fromEntries(
        Object.values(ExamStatus).map((status) => [status, 0]),
      ) as Record<ExamStatus, number>,
      attempts: 0,
      pendingGrading: 0,
      management: isManager
        ? {
            teachers: count(TenantRole.TEACHER),
            parents: count(TenantRole.PARENT),
            quota: await this.memberships.getQuota(ctx),
          }
        : null,
    };
  }
}
