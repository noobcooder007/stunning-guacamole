import { Injectable } from '@nestjs/common';
import { Permission } from '@/auth/domain/entities/permission.entity';

@Injectable()
export abstract class IPermissionRepository {
  abstract findByRoleId(roleId: string): Promise<Permission[]>;
  abstract save(permission: Permission): Promise<Permission>;
  abstract save(permissions: Permission[]): Promise<Permission[]>;
}
