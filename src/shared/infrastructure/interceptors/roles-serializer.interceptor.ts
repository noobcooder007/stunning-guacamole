import {
  Injectable,
  ExecutionContext,
  CallHandler,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class RolesSerializerInterceptor extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((response) => {
        if (response === undefined || response === null) {
          return response;
        }

        const user = request.user;
        const groups = [user?.role || 'public'];

        // 1. Extraer los datos reales (maneja paginado o detalle único)
        const data = response.data || response;

        // 2. Lógica de Owner (solo si es un objeto único de detalle)
        if (!Array.isArray(data)) {
          if (data?.userId) {
            if (data.userId === user.id) {
              groups.push('owner');
            }
          }
        }

        // 3. Serializar con los grupos activos
        const cleanData = instanceToPlain(response, {
          groups,
        });

        return cleanData;
      }),
    );
  }
}
