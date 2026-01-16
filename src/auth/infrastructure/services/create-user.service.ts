import { Inject, Injectable } from '@nestjs/common';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { UserMapper } from '@/auth/infrastructure/mappers/user.mapper';
import { UserRepository } from '../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../domain/services/password.hasher';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { RoleRepository } from '@/auth/domain/repositories/role.repository';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { Role } from '@/auth/domain/entities/role.entity';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: RoleRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(data: CreateUserCommand) {
    const exists = await this.userRepository.findOneByUsername(data.username);
    if (exists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'User already exists',
        entity: User.name,
      });
    }
    const role = await this.roleRepository.findById(data.roleId);
    if (!role)
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Role not found, select another one',
        entity: Role.name,
      });
    const hashedPassword = await this.passwordHasher.hash(data.password);
    data.password = hashedPassword;
    try {
      const user = UserMapper.fromCommandToDomain({
        username: data.username,
        password: data.password,
        roleId: role._id,
      });
      user.assignRole(role);
      await this.userRepository.save(user);
      return Result.ok<User>(user);
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
