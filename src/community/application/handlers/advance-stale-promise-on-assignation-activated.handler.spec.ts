import { AdvanceStalePromiseOnAssignationActivatedHandler } from './advance-stale-promise-on-assignation-activated.handler';
import { AssignationActivatedEvent } from '@/community/application/events/assignation-activated.event';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const BID = '01907c2a-0000-7000-8000-000000000010';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000020';

function makePromise(isActive: boolean, nextDonation: Date | null = null): PromiseDonation {
  const past = new Date('2020-01-15');
  return PromiseDonation.recreate('01907c2a-0000-7000-8000-000000000001', {
    beneficientId: BeneficientId.of(BID),
    promiseAmount: 100,
    currency: 'MXN',
    method: 'CASH',
    startDate: isActive ? past : null,
    recurring: true,
    recurrence: 1,
    isActive,
    createdBy: UserId.of(CREATED_BY),
    createdAt: new Date(),
    updatedAt: new Date(),
    lastDonation: null,
    nextDonation: nextDonation ?? (isActive ? past : null),
    reasonDeactivate: isActive ? null : 'Baja',
  });
}

describe('AdvanceStalePromiseOnAssignationActivatedHandler', () => {
  let handler: AdvanceStalePromiseOnAssignationActivatedHandler;
  let promiseDonationRepository: {
    findByBeneficientId: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    promiseDonationRepository = {
      findByBeneficientId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    handler = new AdvanceStalePromiseOnAssignationActivatedHandler(
      promiseDonationRepository as any,
    );
  });

  it('no debería hacer nada cuando no existe promesa para el beneficiario', async () => {
    promiseDonationRepository.findByBeneficientId.mockResolvedValue(null);
    const event = new AssignationActivatedEvent(BID);

    await handler.handle(event);

    expect(promiseDonationRepository.save).not.toHaveBeenCalled();
  });

  it('no debería hacer nada cuando la promesa existe pero está inactiva', async () => {
    promiseDonationRepository.findByBeneficientId.mockResolvedValue(makePromise(false));
    const event = new AssignationActivatedEvent(BID);

    await handler.handle(event);

    expect(promiseDonationRepository.save).not.toHaveBeenCalled();
  });

  it('debería avanzar la promesa y guardarla cuando está activa y desactualizada', async () => {
    const promise = makePromise(true, new Date('2020-01-15'));
    promiseDonationRepository.findByBeneficientId.mockResolvedValue(promise);
    const event = new AssignationActivatedEvent(BID);

    await handler.handle(event);

    expect(promiseDonationRepository.save).toHaveBeenCalledWith(promise);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    expect(promise.nextDonation.getTime()).toBeGreaterThanOrEqual(currentMonthStart.getTime());
  });

  it('debería buscar la promesa con el beneficientId del evento', async () => {
    promiseDonationRepository.findByBeneficientId.mockResolvedValue(null);
    const event = new AssignationActivatedEvent(BID);

    await handler.handle(event);

    expect(promiseDonationRepository.findByBeneficientId).toHaveBeenCalledWith(BID);
  });
});
