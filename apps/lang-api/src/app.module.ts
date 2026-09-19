import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AttemptsModule } from './attempts/attempts.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EnvironmentVariables, validateEnv } from './config/env.validation';
import { buildDataSourceOptions } from './database/database.config';
import { CatalogModule } from './catalog/catalog.module';
import { ExamsModule } from './exams/exams.module';
import { LessonAttemptsModule } from './lesson-attempts/lesson-attempts.module';
import { LessonsModule } from './lessons/lessons.module';
import { GradingModule } from './grading/grading.module';
import { HealthModule } from './health/health.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PlansModule } from './plans/plans.module';
import { StorageModule } from './storage/storage.module';
import { TenantDashboardModule } from './tenant-dashboard/tenant-dashboard.module';
import { TenantsModule } from './tenants/tenants.module';
import { TrainingModule } from './training/training.module';
import { UserManualModule } from './user-manual/user-manual.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    // Cron chốt section quá giờ (`AttemptsScheduler`).
    ScheduleModule.forRoot(),
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
    CatalogModule,
    ExamsModule,
    LessonsModule,
    LessonAttemptsModule,
    AttemptsModule,
    GradingModule,
    TrainingModule,
    AdminModule,
    UserManualModule,
    // Đăng ký guard toàn cục: mọi route cần đăng nhập trừ route @Public().
    AuthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
