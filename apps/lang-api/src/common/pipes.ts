import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';

/** Tham số id phải là uuid; sai định dạng coi như không tìm thấy (message tiếng Việt). */
export const ParseIdPipe = () =>
  new ParseUUIDPipe({
    exceptionFactory: () => new NotFoundException('Không tìm thấy dữ liệu'),
  });
