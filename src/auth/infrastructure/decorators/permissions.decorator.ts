import { SetMetadata } from '@nestjs/common';
import { PermissionNames } from '@/auth/domain/constants/permissions';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionNames[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
