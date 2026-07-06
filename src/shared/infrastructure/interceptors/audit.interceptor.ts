import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditService } from '@/shared/infrastructure/services/audit.service';
import { transactionStorage } from '@/database/transactional-context';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    const routePath: string = req.route?.path ?? req.path;
    const operation = `${method} ${routePath}`;
    const userId: string | undefined = req.user?.id;
    const traceId: string | undefined = transactionStorage.getStore()?.traceId;
    const ip: string =
      req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? req.ip;
    const userAgent: string = req.headers['user-agent'];
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.auditService
          .log({
            traceId,
            userId,
            operation,
            status: 'SUCCESS',
            durationMs: Date.now() - start,
            ip,
            userAgent,
          })
          .catch(() => {});
      }),
      catchError((err: Error) => {
        this.auditService
          .log({
            traceId,
            userId,
            operation,
            status: 'FAILURE',
            errorMessage: err?.message,
            durationMs: Date.now() - start,
            ip,
            userAgent,
          })
          .catch(() => {});
        return throwError(() => err);
      }),
    );
  }
}
