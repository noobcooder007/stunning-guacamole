import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { ChangeUserPasswordCommand } from '@/auth/application/commands/change-user-password.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(ChangeUserPasswordCommand)
export class ChangeUserPasswordHandler extends BaseCommandHandler<
  ChangeUserPasswordCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly hasherService: IPasswordHasher,
  ) {
    super();
  }

  protected async process(
    command: ChangeUserPasswordCommand,
  ): Promise<Result<void>> {
    const user = await this.userRepository.findOneById(command.userId);
    if (!user) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'User not found',
        entity: ChangeUserPasswordHandler.name,
      });
    }

    const hashedPassword = await this.hasherService.hash(command.newPassword);
    user.changePassword(hashedPassword);
    await this.userRepository.save(user);
    return Result.ok<void>(undefined);
  }
}
