import { ReactivatePromiseDonationHandler } from './reactivate-promise-donation.handler';
import { ReactivatePromiseDonationCommand } from '@/donation/application/command/reactivate-promise-donation.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const PROMISE_ID = '01907c2a-0000-7000-8000-000000000001';
const BID = '01907c2a-0000-7000-8000-000000000002';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000003';

function makePromise(isActive: boolean): PromiseDonation {
  const now = new Date();
  return PromiseDonation.recreate(PROMISE_ID, {
    beneficientId: BeneficientId.of(BID),
    promiseAmount: 100,
    currency: 'MXN',
    method: 'CASH',
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    recurring: true,
    recurrence: 1,
    isActive,
    createdBy: UserId.of(CREATED_BY),
    createdAt: now,
    updatedAt: now,
    lastDonation: null,
    nextDonation: isActive
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : null,
    reasonDeactivate: isActive ? null : 'Baja temporal',
  });
}

function makeHandler(overrides: { findById?: any } = {}) {
  const repo = {
    findById: overrides.findById ?? jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
  };
  return { handler: new ReactivatePromiseDonationHandler(repo as any), repo };
}

describe('ReactivatePromiseDonationHandler', () => {
  it('debería fallar con NOT_FOUND si la promesa no existe', async () => {
    const { handler } = makeHandler();

    const result = await handler.execute(
      new ReactivatePromiseDonationCommand(PROMISE_ID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con CONFLICT si la promesa ya está activa', async () => {
    const { handler } = makeHandler({
      findById: jest.fn().mockResolvedValue(makePromise(true)),
    });

    const result = await handler.execute(
      new ReactivatePromiseDonationCommand(PROMISE_ID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería reactivar y guardar la promesa en el caso exitoso', async () => {
    const promise = makePromise(false);
    const { handler, repo } = makeHandler({
      findById: jest.fn().mockResolvedValue(promise),
    });

    const result = await handler.execute(
      new ReactivatePromiseDonationCommand(PROMISE_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(promise.isActive).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(promise);
  });
});
