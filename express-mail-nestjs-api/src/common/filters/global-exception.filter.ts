import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ExceptionResponse } from '../@type/exception-response.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        | string
        | ExceptionResponse;

      if (typeof exceptionResponse === 'object' && exceptionResponse.errors) {
        return response.status(status).json(exceptionResponse);
      }

      return response.status(status).json({
        success: false,
        message:
          typeof exceptionResponse === 'object'
            ? (exceptionResponse.message ?? 'Internal Server Error')
            : exceptionResponse,
        statusCode: status,
        timeStamp: new Date().toISOString(),
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timeStamp: new Date().toISOString(),
    });
  }
}
