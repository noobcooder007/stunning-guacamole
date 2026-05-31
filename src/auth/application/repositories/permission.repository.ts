import { Injectable } from '@nestjs/common';
import { Permission } from '@/auth/domain/entities/permission.entity';

@Injectable()
export abstract class IPermissionRepository {
  abstract findById(id: string): Promise<Permission | null>;
  abstract findByIds(ids: string[]): Promise<Permission[]>;
  abstract findByRoleId(roleId: string): Promise<Permission[]>;
  abstract findAll(): Promise<Permission[]>;
  abstract save(permission: Permission): Promise<Permission>;
  abstract save(permissions: Permission[]): Promise<Permission[]>;
}
