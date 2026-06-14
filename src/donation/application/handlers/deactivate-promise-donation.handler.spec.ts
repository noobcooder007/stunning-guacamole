import { DeactivatePromiseDonationHandler } from './deactivate-promise-donation.handler';
import { DeactivatePromiseDonationCommand } from '@/donation/application/command/deactivate-promise-donation.command';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const PROMISE_ID = '01907c2a-0000-7000-8000-000000000001';
const BID = '01907c2a-0000-7000-8000-000000000010';
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

describe('DeactivatePromiseDonationHandler', () => {
  let handler: DeactivatePromiseDonationHandler;
  let promiseDonationRepository: { findById: jest.Mock; save: jest.Mock };

  const command = new DeactivatePromiseDonationCommand(PROMISE_ID, 'Solicitud propia');

  beforeEach(() => {
    promiseDonationRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    handler = new DeactivatePromiseDonationHandler(promiseDonationRepository as any);
  });

  it('debería fallar con NOT_FOUND cuando la promesa no existe', async () => {
    promiseDonationRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(promiseDonationRepository.save).not.toHaveBeenCalled();
  });

  it('debería desactivar la promesa con la razón indicada', async () => {
    const promise = makePromise();
    promiseDonationRepository.findById.mockResolvedValue(promise);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(promise.isActive).toBe(false);
    expect(promise.reasonDeactivate).toBe('Solicitud propia');
    expect(promiseDonationRepository.save).toHaveBeenCalledWith(promise);
  });

  it('debería buscar la promesa por id', async () => {
    promiseDonationRepository.findById.mockResolvedValue(null);

    await handler.execute(command);

    expect(promiseDonationRepository.findById).toHaveBeenCalledWith(PROMISE_ID);
  });
});
