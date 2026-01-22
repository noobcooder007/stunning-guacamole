import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { PermissionSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/permission.schema';
import { Permission } from '@/auth/domain/entities/permission.entity';
import {
  IPermissionPersistence,
  PermissionMapper,
} from '@/auth/infrastructure/persistence/mappers/permission.mapper';
import { BaseRepository } from '@/database/base.repository';

@Injectable()
export class TypeORMPermissionRepository
  extends BaseRepository<PermissionSchema>
  implements IPermissionRepository
{
  constructor(datasource: DataSource) {
    super(datasource, PermissionSchema);
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    const permissions = await this.repository.find({
      where: {
        roles: {
          id: roleId,
        },
      },
    });
    return permissions.map((permission) => {
      return PermissionMapper.toDomain(permission);
    });
  }

  async findAll(): Promise<Permission[]> {
    const permissionsModel = await this.repository.find();
    return permissionsModel.map((permission) => {
      return PermissionMapper.toDomain(permission);
    });
  }

  save(permission: Permission): Promise<Permission>;
  save(permissions: Permission[]): Promise<Permission[]>;
  async save(
    permissions: Permission | Permission[],
  ): Promise<Permission | Permission[]> {
    if (Array.isArray(permissions)) {
      const permissionsData = permissions.map((p) =>
        PermissionMapper.toPersistance(p),
      ) as IPermissionPersistence[];
      const permissionsSchema = await this.repository.create(permissionsData);
      await this.repository.save(permissionsSchema);
      return permissions;
    }
    const permission = PermissionMapper.toPersistance(
      permissions,
    ) as IPermissionPersistence;
    const permissionSchema = await this.repository.create(permission);
    await this.repository.save(permissionSchema);
    return permissions;
  }
}
