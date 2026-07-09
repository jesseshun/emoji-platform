import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

const STATUS_TO_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  500: 'INTERNAL_ERROR',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const code = STATUS_TO_CODE[status] ?? 'INTERNAL_ERROR';

    if (exception instanceof Error) {
      this.logger.error(`[${request.method}] ${request.url} → ${status}: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`[${request.method}] ${request.url} → ${status}: ${message}`);
    }

    const body: ErrorBody = {
      success: false,
      error: {
        code,
        message,
      },
    };

    response.status(status).json(body);
  }
}
