import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BeneficientDeactivatedEvent } from '@/community/application/events/beneficient-deactivated.event';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';

@EventsHandler(BeneficientDeactivatedEvent)
export class DeactivateDonationPromises implements IEventHandler<BeneficientDeactivatedEvent> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationsRepository: IPromiseDonationRepository,
  ) {}

  async handle(event: BeneficientDeactivatedEvent) {
    const promiseDonation =
      await this.promiseDonationsRepository.findByBeneficientId(
        event.beneficientId,
      );
    promiseDonation.deactivate(event.reason);
    await this.promiseDonationsRepository.save(promiseDonation);
  }
}
