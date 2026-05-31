import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { GetAllPermissionsQuery } from '@/auth/application/queries/get-all-permissions.query';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

@QueryHandler(GetAllPermissionsQuery)
export class GetAllPermissionsHandler extends BaseQueryHandler<
  GetAllPermissionsQuery,
  PermissionResponse[]
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    _query: GetAllPermissionsQuery,
  ): Promise<Result<PermissionResponse[]>> {
    const permissions = await this.permissionRepository.findAll();
    const response: PermissionResponse[] = permissions.map((p) => ({
      id: p._id.unpack(),
      name: p.name,
      description: p.description,
      isActive: p.isActive,
      createdAt: p.createdAt,
    }));
    return Result.ok(response);
  }
}
