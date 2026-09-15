import {
  ASSIGNABLE_TENANT_ROLES,
  Gender,
  MembershipStatus,
  TenantRole,
} from '@lang/shared';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';
import {
  emptyToUndefined,
  toEmail,
  trimString,
  trimToNull,
} from '../../common/transforms';
import { IsDateOfBirth } from '../../common/validators/is-date-of-birth';
import { NewPassword } from '../../common/validators/new-password';

/** Danh sách role cấp cho thành viên; không nhận `TENANT_OWNER`. */
function AssignableRoles(minSize: number): PropertyDecorator {
  return (target, key) => {
    IsArray({ message: 'Vai trò không hợp lệ' })(target, key);
    if (minSize > 0) {
      ArrayMinSize(minSize, { message: 'Vui lòng chọn ít nhất một vai trò' })(
        target,
        key,
      );
    }
    ArrayUnique({ message: 'Vai trò bị trùng' })(target, key);
    IsIn([...ASSIGNABLE_TENANT_ROLES], {
      each: true,
      message:
        'Vai trò không hợp lệ hoặc không được cấp qua quản lý thành viên',
    })(target, key);
  };
}

function MemberEmail(): PropertyDecorator {
  return (target, key) => {
    Transform(toEmail)(target, key);
    IsEmail({}, { message: 'Email không hợp lệ' })(target, key);
    MaxLength(254, { message: 'Email quá dài' })(target, key);
  };
}

export class ListMembershipsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(TenantRole), { message: 'Vai trò không hợp lệ' })
  role?: TenantRole;

  @IsOptional()
  @IsIn(Object.values(MembershipStatus), { message: 'Trạng thái không hợp lệ' })
  status?: MembershipStatus;

  /** Tìm theo họ tên hoặc email. */
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Từ khoá không hợp lệ' })
  @MaxLength(100, { message: 'Từ khoá tối đa 100 ký tự' })
  q?: string | null;
}

export class AddMemberByEmailDto {
  @MemberEmail()
  email: string;

  @AssignableRoles(1)
  roles: TenantRole[];
}

/** Tạo account mới (bắt đổi mật khẩu khi đăng nhập lần đầu) và thêm vào tenant. */
export class CreateMemberAccountDto {
  @MemberEmail()
  email: string;

  @Transform(trimString)
  @IsString({ message: 'Họ tên không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  @MaxLength(150, { message: 'Họ tên tối đa 150 ký tự' })
  fullName: string;

  @IsDateOfBirth()
  dateOfBirth: string;

  @IsOptional()
  @IsIn(Object.values(Gender), { message: 'Giới tính không hợp lệ' })
  gender?: Gender | null;

  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  @MaxLength(30, { message: 'Số điện thoại tối đa 30 ký tự' })
  @Matches(/^[0-9+().\s-]*$/, {
    message: 'Số điện thoại chỉ gồm chữ số và các ký tự + ( ) . -',
  })
  phone?: string | null;

  /** Mật khẩu tạm do admin nhập; để trống thì hệ thống sinh. */
  @IsOptional()
  @Transform(emptyToUndefined)
  @NewPassword()
  password?: string;

  @AssignableRoles(1)
  roles: TenantRole[];
}

/** PATCH: bỏ trường nào thì giữ nguyên. Với Owner, `roles` là các role ngoài `TENANT_OWNER`. */
export class UpdateMembershipDto {
  @IsOptional()
  @AssignableRoles(0)
  roles?: TenantRole[];

  @IsOptional()
  @IsIn(Object.values(MembershipStatus), { message: 'Trạng thái không hợp lệ' })
  status?: MembershipStatus;
}

export class AddGuardianDto {
  @IsUUID('all', { message: 'Vui lòng chọn phụ huynh' })
  parentMembershipId: string;

  /** Vd. "Mẹ", "Bố". */
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Quan hệ không hợp lệ' })
  @MaxLength(50, { message: 'Quan hệ tối đa 50 ký tự' })
  relationship?: string | null;
}
