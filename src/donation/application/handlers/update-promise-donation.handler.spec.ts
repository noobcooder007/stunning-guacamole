import {
  UpdatePromiseDonationAmountHandler,
  UpdatePromiseDonationRecurrenceHandler,
  UpdatePromiseDonationInstructionsHandler,
} from './update-promise-donation.handler';
import {
  UpdatePromiseDonationAmountCommand,
  UpdatePromiseDonationRecurrenceCommand,
  UpdatePromiseDonationInstructionsCommand,
} from '@/donation/application/command/update-promise-donation.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const PROMISE_ID = '01907c2a-0000-7000-8000-000000000001';
const BID = '01907c2a-0000-7000-8000-000000000002';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000003';

function makePromise(isActive = true): PromiseDonation {
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
    nextDonation: isActive ? new Date(now.getFullYear(), now.getMonth(), 1) : null,
    reasonDeactivate: isActive ? null : 'Baja',
  });
}

function makeRepo(promise: PromiseDonation | null = null) {
  return {
    findById: jest.fn().mockResolvedValue(promise),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

describe('UpdatePromiseDonationAmountHandler', () => {
  it('debería fallar con NOT_FOUND si no existe la promesa', async () => {
    const handler = new UpdatePromiseDonationAmountHandler(makeRepo(null) as any);

    const result = await handler.execute(new UpdatePromiseDonationAmountCommand(PROMISE_ID, 200, 'USD'));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con CONFLICT si la promesa está inactiva', async () => {
    const handler = new UpdatePromiseDonationAmountHandler(makeRepo(makePromise(false)) as any);

    const result = await handler.execute(new UpdatePromiseDonationAmountCommand(PROMISE_ID, 200, 'USD'));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería actualizar el monto y guardar', async () => {
    const promise = makePromise();
    const repo = makeRepo(promise);
    const handler = new UpdatePromiseDonationAmountHandler(repo as any);

    const result = await handler.execute(new UpdatePromiseDonationAmountCommand(PROMISE_ID, 300, 'USD'));

    expect(result.isSuccess).toBe(true);
    expect(promise.promiseAmount).toBe(300);
    expect(promise.currency).toBe('USD');
    expect(repo.save).toHaveBeenCalledWith(promise);
  });
});

describe('UpdatePromiseDonationRecurrenceHandler', () => {
  it('debería fallar con NOT_FOUND si no existe la promesa', async () => {
    const handler = new UpdatePromiseDonationRecurrenceHandler(makeRepo(null) as any);

    const result = await handler.execute(new UpdatePromiseDonationRecurrenceCommand(PROMISE_ID, 3));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con CONFLICT si la promesa está inactiva', async () => {
    const handler = new UpdatePromiseDonationRecurrenceHandler(makeRepo(makePromise(false)) as any);

    const result = await handler.execute(new UpdatePromiseDonationRecurrenceCommand(PROMISE_ID, 3));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería actualizar la recurrencia y guardar', async () => {
    const promise = makePromise();
    const repo = makeRepo(promise);
    const handler = new UpdatePromiseDonationRecurrenceHandler(repo as any);

    const result = await handler.execute(new UpdatePromiseDonationRecurrenceCommand(PROMISE_ID, 6));

    expect(result.isSuccess).toBe(true);
    expect(promise.recurrence).toBe(6);
    expect(repo.save).toHaveBeenCalledWith(promise);
  });
});

describe('UpdatePromiseDonationInstructionsHandler', () => {
  const instructions = {
    weeklySchedule: [{ day: 'lunes', hours: '10:00-12:00' }],
    generalObservations: 'Avisar antes',
  };

  it('debería fallar con NOT_FOUND si no existe la promesa', async () => {
    const handler = new UpdatePromiseDonationInstructionsHandler(makeRepo(null) as any);

    const result = await handler.execute(new UpdatePromiseDonationInstructionsCommand(PROMISE_ID, instructions));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con CONFLICT si la promesa está inactiva', async () => {
    const handler = new UpdatePromiseDonationInstructionsHandler(makeRepo(makePromise(false)) as any);

    const result = await handler.execute(new UpdatePromiseDonationInstructionsCommand(PROMISE_ID, instructions));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería actualizar las instrucciones y guardar', async () => {
    const promise = makePromise();
    const repo = makeRepo(promise);
    const handler = new UpdatePromiseDonationInstructionsHandler(repo as any);

    const result = await handler.execute(new UpdatePromiseDonationInstructionsCommand(PROMISE_ID, instructions));

    expect(result.isSuccess).toBe(true);
    expect(promise.instructions).toEqual(instructions);
    expect(repo.save).toHaveBeenCalledWith(promise);
  });
});
