import { Injectable } from '@nestjs/common';
import { Permission } from '../entities/permission.entity';

@Injectable()
export abstract class PermissionRepository {
  abstract findByRoleId(roleId: string): Promise<Permission[]>;
  abstract save(permission: Permission): Promise<Permission>;
  abstract save(permissions: Permission[]): Promise<Permission[]>;
}
