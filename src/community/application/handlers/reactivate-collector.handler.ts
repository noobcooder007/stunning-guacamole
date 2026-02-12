import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { ReactivateCollectorCommand } from '@/community/application/command/reactivate-collector.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(ReactivateCollectorCommand)
export class ReactivateCollectorHandler extends BaseCommandHandler<ReactivateCollectorCommand> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
  ) {
    super();
  }

  protected async process(
    command: ReactivateCollectorCommand,
  ): Promise<Result<void>> {
    const collector = await this.collectorRepository.findInactiveById(
      command.id,
    );
    if (!collector) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: "The collector was not found or it's already active",
        entity: ReactivateCollectorHandler.name,
      });
    }
    collector.reactivate();
    await this.collectorRepository.save(collector);

    return Result.ok();
  }
}
