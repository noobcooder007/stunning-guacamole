import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from './permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PermissionNames } from '@/auth/domain/constants/permissions';

export function Auth(...permissions: PermissionNames[]) {
  return applyDecorators(
    Permissions(...permissions),
    UseGuards(AuthGuard('jwt'), PermissionsGuard), // 'jwt' es el nombre por defecto del AuthGuard de Passport
  );
}
