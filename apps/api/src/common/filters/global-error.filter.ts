import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorCode =
      typeof exception === 'object' && exception !== null && 'code' in exception
        ? String(exception.code)
        : undefined;
    const uploadLimitError = errorCode?.startsWith('LIMIT_') === true;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : uploadLimitError
          ? errorCode === 'LIMIT_FILE_SIZE'
            ? HttpStatus.PAYLOAD_TOO_LARGE
            : HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : uploadLimitError
          ? { message: 'Upload exceeds the allowed file or multipart limits' }
          : { message: 'Internal server error' };

    if (!(exception instanceof HttpException) && !uploadLimitError) {
      this.logger.error('Unhandled API exception');
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: (request as any).url,
      ...(typeof message === 'object' ? message : { message }),
    });
  }
}
