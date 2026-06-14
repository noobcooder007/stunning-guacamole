import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { AssignationActivatedEvent } from '@/community/application/events/assignation-activated.event';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';

@EventsHandler(AssignationActivatedEvent)
export class AdvanceStalePromiseOnAssignationActivatedHandler
  implements IEventHandler<AssignationActivatedEvent>
{
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationRepository: IPromiseDonationRepository,
  ) {}

  async handle(event: AssignationActivatedEvent): Promise<void> {
    const promise = await this.promiseDonationRepository.findByBeneficientId(
      event.beneficientId,
    );
    if (!promise || !promise.isActive) return;
    promise.advanceNextDonationIfStale();
    await this.promiseDonationRepository.save(promise);
  }
}
