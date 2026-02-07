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
    let collector: Collector;
    const collectorExists = await this.collectorRepository.exists({
      id: command.collectorId,
    });
    if (collectorExists) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Collector not found or deactivated',
        entity: DeactivateCollectorHanlder.name,
      });
    }
    await this.uow.runInTransaction(async () => {
      collector = this.publisher.mergeObjectContext(
        await this.collectorRepository.findById(command.collectorId),
      );
      collector.deactivate();
      await this.collectorRepository.save(collector);
    });
    if (collector) collector.commit();
    return Result.ok();
  }
}
