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
    return next.handle().pipe(
      map((result: Result<any>) => {
        if (result && result.isSuccess) {
          return {
            statusCode: HttpStatus.OK,
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
