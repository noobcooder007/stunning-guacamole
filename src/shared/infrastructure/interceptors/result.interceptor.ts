import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Result } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    return next.handle().pipe(
      map((result: Result<any>) => {
        if (!(result instanceof Result)) {
          return result;
        }
        if (result && result.isSuccess) {
          let statusCode = HttpStatus.OK;
          const val = result.value;
          if (request.method === 'POST') {
            const hasId = val && val.id;
            const hasAddedCount = val && typeof val.addedCount === 'number';
            const isCountPositive = hasAddedCount && val.addedCount > 0;
            if (hasId || isCountPositive) {
              statusCode = HttpStatus.CREATED;
            } else {
              statusCode = HttpStatus.OK;
            }
          }
          response.status(statusCode);
          return {
            statusCode: statusCode,
            data: result.value,
            timestamp: new Date().toISOString(),
          };
        } else if (result && !result.isSuccess) {
          throw new DomainException(
            result.error.message,
            result.error.entity,
            result.error.type,
          );
        }
        return result;
      }),
    );
  }
}
