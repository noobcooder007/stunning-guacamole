import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_PERMITIONS } from '@/auth/infrastructure/decorators/permit-protected.decorator';
import { User } from '@/auth/domain/aggregates/user.aggregate';

@Injectable()
export class UserPermitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validPermitions: string[] = this.reflector.get(
      META_PERMITIONS,
      context.getHandler(),
    );
    if (!validPermitions || validPermitions.length === 0) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    if (!user) throw new BadRequestException('User not found');
    for (const permission of user.role.permissions) {
      if (validPermitions.includes(permission.name)) return true;
    }
    throw new ForbiddenException('User does not have permission');
  }
}
