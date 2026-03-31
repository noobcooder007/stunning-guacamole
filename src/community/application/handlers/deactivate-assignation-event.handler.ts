import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { CollectorDeactivatedEvent } from '@/community/application/events/collector-deactivated.event';
import { IAssignationRepository } from '@/community/domain/repositories/assignation.repository';

@EventsHandler(CollectorDeactivatedEvent)
export class DeactivateAssignationEventHandler implements IEventHandler<CollectorDeactivatedEvent> {
  constructor(
    @Inject(REPOSITORY_TOKENS.ASSIGNATION)
    private readonly assignationRepository: IAssignationRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async handle(event: CollectorDeactivatedEvent) {
    const { collectorId, reason } = event;
    const assignations =
      await this.assignationRepository.findActivesByCollectorId(collectorId);
    if (assignations.length === 0) return;
    assignations.forEach((a) => {
      a.deactivate(reason);
    });
    await this.uow.runInTransaction(async () => {
      await this.assignationRepository.save(assignations);
    });
  }
}
