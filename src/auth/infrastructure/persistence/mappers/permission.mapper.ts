import { Permission } from '@/auth/domain/entities/permission.entity';

export interface IPermissionPersistence {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  isActive: boolean;
}

export class PermissionMapper {
  public static toPersistance(
    permission: Permission | Permission[],
  ): IPermissionPersistence | IPermissionPersistence[] {
    if (!Array.isArray(permission)) {
      return {
        id: permission._id.unpack(),
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        isActive: permission.isActive,
      };
    }
    const permissions = permission;
    return permissions.map((permission) => {
      return {
        id: permission._id.unpack(),
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        isActive: permission.isActive,
      };
    });
  }

  public static toDomain(raw: IPermissionPersistence): Permission {
    return Permission.recreate(raw.id, {
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      isActive: raw.isActive,
    });
  }
}
