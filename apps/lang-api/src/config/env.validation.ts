// Decorator của class-transformer cần reflect-metadata; nạp tại đây vì file
// này còn được dùng ngoài Nest (script migrate, TypeORM CLI, test).
import 'reflect-metadata';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
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

/** Biến để trống trong `.env` coi như chưa đặt (chỉ dùng cho biến tuỳ chọn). */
const blankToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

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

  // --- Cloudflare R2 ---
  // Không bắt buộc: thiếu bất kỳ biến nào thì endpoint upload trả 501 và phần
  // còn lại của API vẫn chạy (xem `R2Service`). `.env.example` để trống các
  // biến này nên giá trị rỗng phải được coi là "chưa đặt", không phải lỗi.

  @IsOptional()
  @Transform(blankToUndefined)
  @IsString()
  R2_ACCOUNT_ID?: string;

  @IsOptional()
  @Transform(blankToUndefined)
  @IsString()
  R2_ACCESS_KEY_ID?: string;

  @IsOptional()
  @Transform(blankToUndefined)
  @IsString()
  R2_SECRET_ACCESS_KEY?: string;

  /** Bucket bật public access: ảnh/audio/video của đề, logo trung tâm. */
  @IsOptional()
  @Transform(blankToUndefined)
  @IsString()
  R2_PUBLIC_BUCKET?: string;

  /** URL gốc của bucket public (`https://pub-….r2.dev` hoặc custom domain). */
  @IsOptional()
  @Transform(blankToUndefined)
  @Matches(/^https?:\/\/\S+$/, {
    message: 'R2_PUBLIC_BASE_URL phải là URL http(s)',
  })
  R2_PUBLIC_BASE_URL?: string;

  /** Bucket tắt public access: ghi âm của học viên, chỉ đọc qua presigned URL. */
  @IsOptional()
  @Transform(blankToUndefined)
  @IsString()
  R2_PRIVATE_BUCKET?: string;
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
