import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { GetRoleByIdQuery } from '@/auth/application/queries/get-role-by-id.query';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { RoleResponse } from './get-all-roles.handler';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler extends BaseQueryHandler<
  GetRoleByIdQuery,
  RoleResponse
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetRoleByIdQuery,
  ): Promise<Result<RoleResponse>> {
    const role = await this.roleRepository.findById(query.id);
    if (!role) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Role not found',
        entity: GetRoleByIdHandler.name,
      });
    }

    return Result.ok<RoleResponse>({
      id: role._id.unpack(),
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      createdAt: role.createdAt,
      permissions: role.permissions.map((p) => ({
        id: p._id.unpack(),
        name: p.name,
        description: p.description,
        isActive: p.isActive,
        createdAt: p.createdAt,
      })),
    });
  }
}
