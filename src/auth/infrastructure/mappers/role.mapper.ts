import { Role } from '@/auth/domain/entities/role.entity';
import { RoleModel } from '../models/rol.model';
import { PermissionMapper } from './permission.mapper';

export class RoleMapper {
  public static toPersistance(role: Role): any {
    return {
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((permission) =>
        PermissionMapper.toPersistance(permission),
      ),
      createdAt: role.createdAt,
      isActive: role.isActive,
    };
  }

  public static toDomain(raw: RoleModel): Role {
    return Role.recreate(raw.id, {
      name: raw.name,
      description: raw.description,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      permissions: raw.permissions.map((permission) =>
        PermissionMapper.toDomain(permission),
      ),
    });
  }
}
