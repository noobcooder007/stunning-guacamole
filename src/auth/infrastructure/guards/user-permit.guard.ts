import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_PERMITIONS } from '@/auth/infrastructure/decorators/permit-protected.decorator';

@Injectable()
export class UserPermitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const validPermitions: string[] = this.reflector.get(
      META_PERMITIONS,
      context.getHandler(),
    );
    if (!validPermitions || validPermitions.length === 0) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new BadRequestException('User not found in request');
    const userRights: string[] = user.rights || [];
    const hasPermission = validPermitions.some((permission) =>
      userRights.includes(permission),
    );
    if (hasPermission) return true;
    throw new ForbiddenException('User does not have permission');
  }
}
