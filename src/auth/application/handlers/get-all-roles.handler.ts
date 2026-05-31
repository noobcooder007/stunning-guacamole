import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { GetAllRolesQuery } from '@/auth/application/queries/get-all-roles.query';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PermissionResponse } from './get-all-permissions.handler';

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  permissions: PermissionResponse[];
}

@QueryHandler(GetAllRolesQuery)
export class GetAllRolesHandler extends BaseQueryHandler<
  GetAllRolesQuery,
  RoleResponse[]
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    _query: GetAllRolesQuery,
  ): Promise<Result<RoleResponse[]>> {
    const roles = await this.roleRepository.findAll();
    const response: RoleResponse[] = roles.map((r) => ({
      id: r._id.unpack(),
      name: r.name,
      description: r.description,
      isActive: r.isActive,
      createdAt: r.createdAt,
      permissions: r.permissions.map((p) => ({
        id: p._id.unpack(),
        name: p.name,
        description: p.description,
        isActive: p.isActive,
        createdAt: p.createdAt,
      })),
    }));
    return Result.ok(response);
  }
}
