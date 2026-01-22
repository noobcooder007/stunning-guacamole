import { Inject, Injectable } from '@nestjs/common';
import { CreateUserAdminCommand } from '@/auth/application/commands/create-user-admin.command';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import {
  ErrorType,
  IErrorResult,
  Result,
} from '@/shared/domain/dto/result.dto';
import { User, UserId } from '@/auth/domain/aggregates/user.aggregate';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateUserAdminService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    data: CreateUserAdminCommand,
  ): Promise<Result<UserId, IErrorResult>> {
    const exists = await this.userRepository.findOneByUsername(data.username);
    if (exists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'User already exists',
        entity: User.name,
      });
    }
    const role = await this.roleRepository.findByName('administrator');
    if (!role)
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Role not found, select another one',
        entity: Role.name,
      });
    const hashedPassword = await this.passwordHasher.hash(data.password);
    data.password = hashedPassword;
    try {
      const { username, password } = data;
      const user = User.create({ username, password, roleId: role._id });
      await this.userRepository.save(user);
      return Result.ok<UserId>(user._id);
    } catch (err) {
      if (err instanceof DomainException)
        return Result.fail({
          type: ErrorType.VALIDATION,
          message: err.message,
          entity: User.name,
        });
    }
  }
}
