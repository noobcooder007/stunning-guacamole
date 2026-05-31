import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionNames[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Bypass para el rol superadministrator
    // Asumimos que el payload del JWT incluye el rol del usuario
    if (user && user.role === 'superadministrator') {
      return true;
    }

    // Verificación rigurosa de permisos
    // Se comparan los PermissionNames requeridos contra los 'rights' del token
    const userPermissions: string[] = user?.rights || [];

    return requiredPermissions.every((permission: PermissionNames) =>
      userPermissions.includes(permission),
    );
  }
}
