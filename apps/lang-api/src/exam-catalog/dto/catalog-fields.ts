import {
  EXAM_CATALOG_CODE_MAX_LENGTH,
  EXAM_CATALOG_CODE_PATTERN,
  EXAM_CATALOG_DESCRIPTION_MAX_LENGTH,
  EXAM_CATALOG_NAME_MAX_LENGTH,
  normalizeCatalogCode,
} from '@lang/shared';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { trimString, trimToNull } from '../../common/transforms';
import { composeDecorators } from '../../common/validators/fields';

const toCode = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? normalizeCatalogCode(value) : value;

/** Mã danh mục/loại đề/module; tự đổi sang in hoa. */
export const CatalogCodeField = (label: string) =>
  composeDecorators(
    Transform(toCode),
    IsString({ message: `${label} không hợp lệ` }),
    IsNotEmpty({ message: `Vui lòng nhập ${label.toLowerCase()}` }),
    MaxLength(EXAM_CATALOG_CODE_MAX_LENGTH, {
      message: `${label} tối đa ${EXAM_CATALOG_CODE_MAX_LENGTH} ký tự`,
    }),
    Matches(EXAM_CATALOG_CODE_PATTERN, {
      message: `${label} chỉ gồm chữ in hoa không dấu, số và dấu "-" hoặc "_" ở giữa`,
    }),
  );

export const CatalogNameField = (label: string) =>
  composeDecorators(
    Transform(trimString),
    IsString({ message: `${label} không hợp lệ` }),
    IsNotEmpty({ message: `Vui lòng nhập ${label.toLowerCase()}` }),
    MaxLength(EXAM_CATALOG_NAME_MAX_LENGTH, {
      message: `${label} tối đa ${EXAM_CATALOG_NAME_MAX_LENGTH} ký tự`,
    }),
  );

/** Tuỳ chọn; chuỗi rỗng thành `null`. */
export const CatalogDescriptionField = () =>
  composeDecorators(
    IsOptional(),
    Transform(trimToNull),
    IsString({ message: 'Mô tả không hợp lệ' }),
    MaxLength(EXAM_CATALOG_DESCRIPTION_MAX_LENGTH, {
      message: `Mô tả tối đa ${EXAM_CATALOG_DESCRIPTION_MAX_LENGTH} ký tự`,
    }),
  );

export const IsActiveField = () =>
  IsBoolean({ message: 'Trạng thái sử dụng không hợp lệ' });
