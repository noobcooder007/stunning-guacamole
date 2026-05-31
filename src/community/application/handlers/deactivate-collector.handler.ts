import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { DeactivateCollectorCommand } from '@/community/application/command/deactivate-collector.command';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';

@CommandHandler(DeactivateCollectorCommand)
export class DeactivateCollectorHanlder extends BaseCommandHandler<
  DeactivateCollectorCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    private readonly publisher: EventPublisher,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: DeactivateCollectorCommand,
  ): Promise<Result<void>> {
    const collector = await this.collectorRepository.findById(
      command.collectorId,
    );

    if (!collector) {
      const exists = await this.collectorRepository.exists({
        id: command.collectorId,
      });
      if (!exists) {
        return Result.fail({
          type: ErrorType.NOT_FOUND,
          message: 'Collector not found',
          entity: DeactivateCollectorHanlder.name,
        });
      }
      // Already deactivated — idempotent success
      return Result.ok();
    }

    let mergedCollector: Collector;
    await this.uow.runInTransaction(async () => {
      mergedCollector = this.publisher.mergeObjectContext(collector);
      mergedCollector.deactivate();
      await this.collectorRepository.save(mergedCollector);
    });
    if (mergedCollector) mergedCollector.commit();
    return Result.ok();
  }
}
