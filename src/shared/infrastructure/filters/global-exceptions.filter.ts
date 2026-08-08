import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { transactionStorage } from '@/database/transactional-context';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  private readonly domainToHttpMap: Record<ErrorType, HttpStatus> = {
    [ErrorType.NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ErrorType.VALIDATION]: HttpStatus.BAD_REQUEST,
    [ErrorType.CONFLICT]: HttpStatus.CONFLICT,
    [ErrorType.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
    [ErrorType.FORBIDDEN]: HttpStatus.FORBIDDEN,
    [ErrorType.PDF_GENERATION_FAILED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 1. Recuperar el Trace ID del contexto asíncrono
    const store = transactionStorage.getStore();
    const traceId = store?.traceId || 'no-trace-id';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const nestResponse = exception.getResponse();
      message =
        typeof nestResponse === 'object'
          ? (nestResponse as any).message
          : nestResponse;
      errorCode = 'HTTP_ERROR';
    } else if (exception instanceof DomainException) {
      status = this.domainToHttpMap[exception.type] || HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = exception.type;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Ha ocurrido algun error inesperado en el servidor';
      errorCode = 'INTERNAL_SERVER_ERROR';
    }

    // 2. Pasar el traceId al logger
    this.handleLogging(request, exception, status, message, traceId);

    response.status(status).json({
      success: false,
      error: {
        type: errorCode,
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        traceId: traceId, // 3. Devolverlo al cliente para soporte
      },
    });
  }

  private handleLogging(
    request: any,
    exception: any,
    status: number,
    message: any,
    traceId: string, // Recibir traceId
  ) {
    // Incluir traceId en el formato del log
    const logInfo = `[${traceId}] [${request.method}] ${request.url} - Status: ${status}`;

    if (status >= 500) {
      this.logger.error(
        `${logInfo} - Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      const cleanMessage = Array.isArray(message)
        ? message.join(', ')
        : message;

      const entityInfo = exception?.entityName
        ? ` - Entity: ${exception.entityName}`
        : '';

      this.logger.warn(`${logInfo} - Details: ${cleanMessage}${entityInfo}`);
    }
  }
}
