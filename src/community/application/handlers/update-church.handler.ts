import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UpdateChurchCommand } from '@/community/application/command/update-church.command';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { IChurchRepository } from '@/community/application/repositories/church.repository';

@CommandHandler(UpdateChurchCommand)
export class UpdateChurchHandler extends BaseCommandHandler<
  UpdateChurchCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
  ) {
    super();
  }

  async process(command: UpdateChurchCommand): Promise<Result<void>> {
    const church = await this.churchRepository.findById(command.id);
    if (!church) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The church was not found',
        entity: UpdateChurchHandler.name,
      });
    }
    church.update(command);
    await this.churchRepository.save(church);
    return Result.ok();
  }
}
