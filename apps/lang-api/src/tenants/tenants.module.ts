import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipRole } from '../memberships/membership-role.entity';
import { Membership } from '../memberships/membership.entity';
import { PlansModule } from '../plans/plans.module';
import { UsersModule } from '../users/users.module';
import { PublicTenantsController } from './public-tenants.controller';
import { TenantMeController } from './tenant-me.controller';
import { Tenant } from './tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

/**
 * Đăng ký tenant và `TenantGuard`. Module dưới `/t/:slug` import module này để
 * có repository `Tenant`/`Membership`/`MembershipRole` mà guard cần.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, Membership, MembershipRole]),
    PlansModule,
    UsersModule,
  ],
  controllers: [TenantsController, PublicTenantsController, TenantMeController],
  providers: [TenantsService],
  exports: [TypeOrmModule, PlansModule, UsersModule],
})
export class TenantsModule {}
