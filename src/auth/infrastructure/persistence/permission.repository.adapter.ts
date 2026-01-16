import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PermissionRepository } from '@/auth/domain/repositories/permission.repository';
import { PermissionModel } from '@/auth/infrastructure/models/permission.model';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { PermissionMapper } from '../mappers/permission.mapper';
import { BaseRepository } from '@/database/base.repository';

@Injectable()
export class PermissionRepositoryAdapter
  extends BaseRepository<PermissionModel>
  implements PermissionRepository
{
  constructor(datasource: DataSource) {
    super(datasource, PermissionModel);
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

  save(permission: Permission): Promise<Permission>;
  save(permissions: Permission[]): Promise<Permission[]>;
  async save(
    permissions: Permission | Permission[],
  ): Promise<Permission | Permission[]> {
    if (Array.isArray(permissions)) {
      const permissionsModel = permissions.map((p) =>
        PermissionMapper.toPersistance(p),
      );
      await this.repository.save(permissionsModel);
      return permissions as Permission[];
    }
    await this.repository.save(PermissionMapper.toPersistance(permissions));
    return permissions as Permission;
  }
}
