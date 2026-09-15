import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { toEmail, trimString } from '../../common/transforms';
import { IsDateOfBirth } from '../../common/validators/is-date-of-birth';
import { NewPassword } from '../../common/validators/new-password';

export class RegisterDto {
  @Transform(toEmail)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(254, { message: 'Email quá dài' })
  email: string;

  @NewPassword()
  password: string;

  @Transform(trimString)
  @IsString({ message: 'Họ tên không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  @MaxLength(150, { message: 'Họ tên tối đa 150 ký tự' })
  fullName: string;

  @IsDateOfBirth()
  dateOfBirth: string;
}

export class LoginDto {
  @Transform(toEmail)
  @IsString({ message: 'Vui lòng nhập email' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  email: string;

  @IsString({ message: 'Vui lòng nhập mật khẩu' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(200, { message: 'Mật khẩu quá dài' })
  password: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  @MaxLength(200, { message: 'Mật khẩu quá dài' })
  currentPassword: string;

  @NewPassword()
  newPassword: string;
}
