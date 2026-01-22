import { Role } from '@/auth/domain/aggregates/role.aggregate';
import {
  IPermissionPersistence,
  PermissionMapper,
} from '@/auth/infrastructure/persistence/mappers/permission.mapper';

export interface IRolePersistence {
  id: string;
  name: string;
  description: string;
  permissions: IPermissionPersistence[];
  createdAt: Date;
  isActive: boolean;
}

export class RoleMapper {
  public static toPersistance(role: Role): IRolePersistence {
    return {
      id: role._id.unpack(),
      name: role.name,
      description: role.description,
      permissions: PermissionMapper.toPersistance(
        role.permissions,
      ) as IPermissionPersistence[],
      createdAt: role.createdAt,
      isActive: role.isActive,
    };
  }

  public static toDomain(raw: IRolePersistence): Role {
    return Role.recreate(raw.id, {
      name: raw.name,
      description: raw.description,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      permissions: new Set(
        raw.permissions.map((permission) =>
          PermissionMapper.toDomain(permission),
        ),
      ),
    });
  }
}
