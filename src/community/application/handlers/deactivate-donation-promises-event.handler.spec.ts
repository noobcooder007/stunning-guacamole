import { DeactivateDonationPromises } from './deactivate-donation-promises-event.handler';
import { BeneficientDeactivatedEvent } from '@/community/application/events/beneficient-deactivated.event';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const BID = '01907c2a-0000-7000-8000-000000000001';
const PROMISE_ID = '01907c2a-0000-7000-8000-000000000010';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000020';

function makePromise(): PromiseDonation {
  const now = new Date();
  return PromiseDonation.recreate(PROMISE_ID, {
    beneficientId: BeneficientId.of(BID),
    promiseAmount: 100,
    currency: 'MXN',
    method: 'CASH',
    startDate: new Date('2026-01-01'),
    recurring: true,
    recurrence: 1,
    isActive: true,
    createdBy: UserId.of(CREATED_BY),
    createdAt: now,
    updatedAt: now,
    lastDonation: null,
    nextDonation: new Date('2026-01-01'),
    reasonDeactivate: null,
  });
}

describe('DeactivateDonationPromises', () => {
  let handler: DeactivateDonationPromises;
  let promiseDonationsRepository: { findByBeneficientId: jest.Mock; save: jest.Mock };

  const event = new BeneficientDeactivatedEvent(BID, 'Baja voluntaria');

  beforeEach(() => {
    promiseDonationsRepository = {
      findByBeneficientId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    handler = new DeactivateDonationPromises(promiseDonationsRepository as any);
  });

  it('debería desactivar la promesa con la razón del evento', async () => {
    const promise = makePromise();
    promiseDonationsRepository.findByBeneficientId.mockResolvedValue(promise);

    await handler.handle(event);

    expect(promise.isActive).toBe(false);
    expect(promise.reasonDeactivate).toBe('Baja voluntaria');
    expect(promiseDonationsRepository.save).toHaveBeenCalledWith(promise);
  });

  it('debería buscar la promesa con el beneficientId del evento', async () => {
    promiseDonationsRepository.findByBeneficientId.mockResolvedValue(makePromise());

    await handler.handle(event);

    expect(promiseDonationsRepository.findByBeneficientId).toHaveBeenCalledWith(BID);
  });
});
