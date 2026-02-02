import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { DesactivateAssignationsEvent } from '@/community/application/events/desactivate-assignation.event';
import { IAssignationRepository } from '@/community/application/repositories/assignation.repository';

@EventsHandler(DesactivateAssignationsEvent)
export class DesactivateAssignationEventHandler implements IEventHandler<DesactivateAssignationsEvent> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly assignationRepository: IAssignationRepository,
  ) {}

  async handle(event: DesactivateAssignationsEvent) {
    const { collectorId, assignationsIds, reason } = event;
    if (assignationsIds.length === 0) return;
    const assignations =
      await this.assignationRepository.findActiveByCollectorIdAndBeneficientIds(
        collectorId,
        assignationsIds,
      );
    assignations.map((a) => {
      a.desactivate(reason);
    });
    await this.assignationRepository.save(assignations);
  }
}
