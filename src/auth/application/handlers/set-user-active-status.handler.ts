import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { SetUserActiveStatusCommand } from '@/auth/application/commands/set-user-active-status.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(SetUserActiveStatusCommand)
export class SetUserActiveStatusHandler extends BaseCommandHandler<
  SetUserActiveStatusCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  protected async process(
    command: SetUserActiveStatusCommand,
  ): Promise<Result<void>> {
    const user = await this.userRepository.findOneById(command.userId);
    if (!user) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'User not found',
        entity: SetUserActiveStatusHandler.name,
      });
    }

    if (command.isActive) {
      user.activate();
    } else {
      user.deactivate();
    }

    await this.userRepository.save(user);
    return Result.ok<void>(undefined);
  }
}
