import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorBody {
  statusCode: number;
  /** Chuỗi, hoặc danh sách lỗi validation (frontend nối lại bằng dấu phẩy). */
  message: string | string[];
}

/**
 * Chuẩn hoá lỗi thành `{ statusCode, message }` như lightc-general. Lỗi không
 * mong đợi được log đầy đủ nhưng không lộ chi tiết ra client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
      response.status(statusCode).json({ statusCode, message } as ErrorBody);
      return;
    }

    const request = http.getRequest<Request>();
    this.logger.error(
      `${request.method} ${request.originalUrl}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(statusCode).json({
      statusCode,
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
    } as ErrorBody);
  }
}
