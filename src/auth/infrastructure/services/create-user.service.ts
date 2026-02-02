import { Inject, Injectable } from '@nestjs/common';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { Role } from '@/auth/domain/aggregates/role.aggregate';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(data: CreateUserCommand) {
    const [user, role] = await Promise.all([
      this.userRepository.findOneByUsername(data.username),
      this.roleRepository.findByName('collector'),
    ]);
    if (user) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'User already exists',
        entity: User.name,
      });
    }
    if (!role)
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Role not found, select another one',
        entity: Role.name,
      });
    const hashedPassword = await this.passwordHasher.hash(data.password);
    data.password = hashedPassword;
    const { username, password } = data;
    const userToSave = User.create({ username, password, roleId: role._id });
    const userId = await this.userRepository.save(userToSave);
    return Result.ok(userId);
  }
}
