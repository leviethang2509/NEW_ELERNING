import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  hasAnyRole,
  MembershipStatus,
  TenantStatus,
  type TenantRole,
} from '@lang/shared';
import { IsNull, type Repository } from 'typeorm';
import { MembershipRole } from '../memberships/membership-role.entity';
import { Membership } from '../memberships/membership.entity';
import {
  TENANT_ROLES_KEY,
  type TenantContext,
  type TenantRequest,
} from './tenant-context';
import { Tenant } from './tenant.entity';

const LAST_ACTIVE_INTERVAL_MS = 60 * 60 * 1000;

const UNAVAILABLE_MESSAGES: Record<TenantStatus, string> = {
  [TenantStatus.PENDING]: 'Trung tâm đang chờ duyệt',
  [TenantStatus.REJECTED]: 'Trung tâm đã bị từ chối, vui lòng sửa và gửi lại',
  [TenantStatus.SUSPENDED]: 'Trung tâm đang bị tạm khoá',
  [TenantStatus.ACTIVE]: '',
};

/**
 * Guard cho route `/t/:slug/*` (gắn bằng `@UseGuards`, chạy sau guard toàn
 * cục): tenant tồn tại và `active`, user có membership `active`, đủ role theo
 * `@TenantRoles()`. System Owner/Admin không được bỏ qua nếu không là thành viên.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Tenant) private readonly tenants: Repository<Tenant>,
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
    @InjectRepository(MembershipRole)
    private readonly membershipRoles: Repository<MembershipRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const { user } = request;
    if (!user) throw new UnauthorizedException('Bạn chưa đăng nhập');

    const slug = String(request.params.slug ?? '').toLowerCase();
    const tenant = slug ? await this.tenants.findOneBy({ slug }) : null;
    const membership = tenant
      ? await this.memberships.findOneBy({
          tenantId: tenant.id,
          userId: user.id,
          status: MembershipStatus.ACTIVE,
          deletedAt: IsNull(),
        })
      : null;

    // Người ngoài không phân biệt được tenant chưa hoạt động với tenant không tồn tại.
    if (!tenant || (!membership && tenant.status !== TenantStatus.ACTIVE)) {
      throw new NotFoundException('Không tìm thấy trung tâm');
    }
    if (!membership) {
      throw new ForbiddenException(
        'Bạn không phải thành viên của trung tâm này',
      );
    }
    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new ForbiddenException(UNAVAILABLE_MESSAGES[tenant.status]);
    }
    await this.touchLastActive(membership);

    const roles = (
      await this.membershipRoles.findBy({ membershipId: membership.id })
    ).map((row) => row.role);
    const required = this.reflector.getAllAndOverride<TenantRole[] | undefined>(
      TENANT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (required?.length && !hasAnyRole(roles, required)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    const tenantCtx: TenantContext = {
      tenantId: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      status: tenant.status,
      membershipId: membership.id,
      roles,
    };
    request.tenantCtx = tenantCtx;
    return true;
  }

  /**
   * Ghi lần vào tenant (dùng cho gợi ý ngừng kích hoạt khi vượt gói). Tối đa
   * 1 lần/giờ để không ghi DB ở mọi request.
   */
  private async touchLastActive(membership: Membership): Promise<void> {
    const now = new Date();
    if (
      membership.lastActiveAt &&
      now.getTime() - membership.lastActiveAt.getTime() <
        LAST_ACTIVE_INTERVAL_MS
    ) {
      return;
    }
    await this.memberships.update(membership.id, { lastActiveAt: now });
  }
}
