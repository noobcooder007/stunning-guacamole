import { Permission } from '@/auth/domain/entities/permission.entity';
import { PermissionModel } from '../models/permission.model';

export class PermissionMapper {
  public static toPersistance(
    permission: Permission | Permission[],
  ): any | any[] {
    if (!Array.isArray(permission)) {
      return {
        id: permission._id,
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        isActive: permission.isActive,
      };
    }
    const permissions = permission;
    return permissions.map((permission) => {
      return {
        id: permission._id,
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        isActive: permission.isActive,
      };
    });
  }

  public static toDomain(raw: PermissionModel): Permission {
    return Permission.recreate(raw.id, {
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      isActive: raw.isActive,
    });
  }
}
