import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { ChangeUsernameCommand } from '@/auth/application/commands/change-username.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(ChangeUsernameCommand)
export class ChangeUsernameHandler extends BaseCommandHandler<
  ChangeUsernameCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  protected async process(
    command: ChangeUsernameCommand,
  ): Promise<Result<void>> {
    const user = await this.userRepository.findOneById(command.userId);
    if (!user) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'User not found',
        entity: ChangeUsernameHandler.name,
      });
    }

    const existing = await this.userRepository.findOneByUsername(
      command.newUsername,
    );
    if (existing && existing._id.unpack() !== command.userId) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'Username already taken',
        entity: ChangeUsernameHandler.name,
      });
    }

    user.changeUsername(command.newUsername);
    await this.userRepository.save(user);
    return Result.ok<void>(undefined);
  }
}
