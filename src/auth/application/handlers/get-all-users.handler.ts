import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { GetAllUsersQuery } from '@/auth/application/queries/get-all-users.query';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

export interface UserListItemResponse {
  id: string;
  username: string;
  isActive: boolean;
  gender?: string;
  roleId: string;
  role: string;
  createdAt: Date;
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler extends BaseQueryHandler<
  GetAllUsersQuery,
  UserListItemResponse[]
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    _query: GetAllUsersQuery,
  ): Promise<Result<UserListItemResponse[]>> {
    const [users, roles] = await Promise.all([
      this.userRepository.findAll(),
      this.roleRepository.findAll(),
    ]);

    const roleMap = new Map(roles.map((r) => [r._id.unpack(), r.name]));

    const response: UserListItemResponse[] = users.map((u) => ({
      id: u._id.unpack(),
      username: u.username,
      isActive: u.isActive,
      gender: u.gender,
      roleId: u.role.unpack(),
      role: roleMap.get(u.role.unpack()) ?? 'unknown',
      createdAt: u.createdAt,
    }));

    return Result.ok(response);
  }
}
