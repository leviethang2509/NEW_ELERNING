import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EnvironmentVariables, validateEnv } from './config/env.validation';
import { buildDataSourceOptions } from './database/database.config';
import { HealthModule } from './health/health.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PlansModule } from './plans/plans.module';
import { StorageModule } from './storage/storage.module';
import { TenantDashboardModule } from './tenant-dashboard/tenant-dashboard.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        ...buildDataSourceOptions({
          DB_HOST: config.get('DB_HOST', { infer: true }),
          DB_PORT: config.get('DB_PORT', { infer: true }),
          DB_USERNAME: config.get('DB_USERNAME', { infer: true }),
          DB_PASSWORD: config.get('DB_PASSWORD', { infer: true }),
          DB_NAME: config.get('DB_NAME', { infer: true }),
          DB_SCHEMA: config.get('DB_SCHEMA', { infer: true }),
          DB_LOGGING: config.get('DB_LOGGING', { infer: true }),
        }),
        autoLoadEntities: true,
      }),
    }),
    HealthModule,
    UsersModule,
    PlansModule,
    TenantsModule,
    MembershipsModule,
    TenantDashboardModule,
    StorageModule,
    AdminModule,
    // Đăng ký guard toàn cục: mọi route cần đăng nhập trừ route @Public().
    AuthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
