import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly prismaService: PrismaService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    this.logger.error(
      `❌ ${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Create audit log for errors (except for client errors)
    if (status >= 500) {
      try {
        await this.prismaService.createAuditLog({
          action: 'error',
          entityType: 'System',
          oldData: {
            url: request.url,
            method: request.method,
            statusCode: status,
            error: error,
            message: message,
          },
          ipAddress: request.ip,
          userAgent: request.get('User-Agent'),
        });
      } catch (auditError) {
        this.logger.error('Failed to create audit log for error:', auditError);
      }
    }

    // Send response
    response.status(status).json({
      success: false,
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
    });
  }
}
