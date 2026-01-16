import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleRepository } from '@/auth/domain/repositories/role.repository';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';
import { Role } from '@/auth/domain/entities/role.entity';
import { RoleMapper } from '@/auth/infrastructure/mappers/role.mapper';
import { BaseRepository } from '@/database/base.repository';

@Injectable()
export class RoleRepositoryAdapter
  extends BaseRepository<RoleModel>
  implements RoleRepository
{
  constructor(datasource: DataSource) {
    super(datasource, RoleModel);
  }

  async findById(id: string): Promise<Role | null> {
    const roleModel = await this.repository.findOne({
      where: { id },
      relations: {
        permissions: true,
      },
    });
    if (!roleModel) return null;
    return RoleMapper.toDomain(roleModel);
  }

  async findByName(name: string): Promise<Role | null> {
    const roleModel = await this.repository.findOneBy({ name: name });
    if (!roleModel) return null;
    return RoleMapper.toDomain(roleModel);
  }

  save(role: Role): Promise<Role>;
  save(roles: Role[]): Promise<Role[]>;
  async save(roles: Role | Role[]): Promise<Role | Role[]> {
    if (Array.isArray(roles)) {
      const rolesModel = roles.map((r) => RoleMapper.toPersistance(r));
      await this.repository.save(rolesModel);
      return roles as Role[];
    }
    await this.repository.save(RoleMapper.toPersistance(roles));
    return roles as Role;
  }
}
