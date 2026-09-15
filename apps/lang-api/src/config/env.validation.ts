// Decorator của class-transformer cần reflect-metadata; nạp tại đây vì file
// này còn được dùng ngoài Nest (script migrate, TypeORM CLI, test).
import 'reflect-metadata';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { DURATION_PATTERN } from '../common/duration';

export const NODE_ENVS = ['development', 'production', 'test'] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

/**
 * Biến môi trường của lang-api. Kiểm tra lúc khởi động: thiếu hoặc sai là
 * dừng ngay, không có giá trị dự phòng cho secret (khác lightc-general).
 */
export class EnvironmentVariables {
  @IsIn(NODE_ENVS)
  NODE_ENV: NodeEnv = 'development';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3101;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  DB_PORT = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  /** Có thể để trống nếu Postgres dùng trust auth. */
  @IsString()
  DB_PASSWORD = '';

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  /** Tên được ghép thẳng vào SQL (`CREATE SCHEMA`) nên chỉ cho phép ký tự an toàn. */
  @Matches(/^[a-z_][a-z0-9_]*$/)
  DB_SCHEMA = 'public';

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  DB_LOGGING = false;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  /** Thời hạn access token, dạng `<số><s|m|h|d>`. */
  @Matches(DURATION_PATTERN)
  JWT_ACCESS_EXPIRES_IN = '15m';

  /** Thời hạn refresh token (cookie), gia hạn lại mỗi lần refresh. */
  @Matches(DURATION_PATTERN)
  REFRESH_EXPIRES_IN = '30d';

  /** Cookie refresh chỉ gửi qua HTTPS. VPS hiện chạy HTTP nên mặc định `false`. */
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  COOKIE_SECURE = false;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    exposeDefaultValues: true,
  });
  const errors = validateSync(env);
  if (errors.length > 0) {
    const details = errors
      .map(
        (error) =>
          `- ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
      )
      .join('\n');
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${details}`);
  }
  return env;
}
