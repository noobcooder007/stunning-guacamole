import { GenerateRecurringReceiptsHandler } from './generate-recurring-receipts.handler';
import { GenerateRecurringReceiptsCommand } from '@/donation/application/command/generate-recurring-receipts.command';
import { ReceiptFolio } from '@/donation/domain/aggregates/receipt.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000002';
const PROMISE_ID = '01907c2a-0000-7000-8000-000000000003';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000004';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000005';

function makePeriod(month: number, year: number) {
  return {
    month,
    year,
    _id: { unpack: () => PERIOD_ID },
  };
}

function makeHandlerDeps(
  overrides: {
    findOpen?: any;
    searchWithActiveAssignments?: jest.Mock;
    receiptExists?: boolean;
  } = {},
) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const promiseDonationService = {
    searchWithActiveAssignments:
      overrides.searchWithActiveAssignments ?? jest.fn().mockResolvedValue([]),
  };
  const promiseDonationRepository = {
    save: jest.fn().mockResolvedValue(undefined),
  };
  const receiptRepository = {
    exists: jest.fn().mockResolvedValue(overrides.receiptExists ?? false),
    save: jest.fn().mockResolvedValue(undefined),
  };
  const periodRepository = {
    findOpen: overrides.findOpen ?? jest.fn().mockResolvedValue(null),
  };
  const folioProvider = {
    generateNext: jest
      .fn()
      .mockResolvedValue(
        ReceiptFolio.create(new Date(), '001', 1, 'RECURRING'),
      ),
  };
  const hasher = { hash: jest.fn().mockResolvedValue('hashed-chain-value') };
  const uow = {
    runInTransaction: jest
      .fn()
      .mockImplementation((fn: () => Promise<any>) => fn()),
  };

  const handler = new GenerateRecurringReceiptsHandler(
    promiseDonationService as any,
    promiseDonationRepository as any,
    receiptRepository as any,
    periodRepository as any,
    folioProvider as any,
    hasher as any,
    uow as any,
  );

  return {
    handler,
    promiseDonationRepository,
    receiptRepository,
    folioProvider,
    uow,
    currentMonth,
    currentYear,
  };
}

describe('GenerateRecurringReceiptsHandler', () => {
  it('debería fallar con CONFLICT si el periodo abierto no es del mes actual', async () => {
    const now = new Date();
    const wrongMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const wrongYear =
      wrongMonth === 12 ? now.getFullYear() - 1 : now.getFullYear();

    const { handler } = makeHandlerDeps({
      findOpen: jest.fn().mockResolvedValue(makePeriod(wrongMonth, wrongYear)),
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería tener éxito cuando no hay periodo abierto y no hay promesas', async () => {
    const { handler } = makeHandlerDeps();

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
  });

  it('debería tener éxito cuando el periodo abierto coincide con el mes actual', async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const { handler } = makeHandlerDeps({
      findOpen: jest
        .fn()
        .mockResolvedValue(makePeriod(currentMonth, currentYear)),
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
  });

  it('debería generar recibos por las promesas cuya nextDonation cae en el mes actual', async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const nextDonationInCurrentMonth = new Date(currentYear, now.getMonth(), 1);

    const promiseRow = {
      id: PROMISE_ID,
      beneficientId: BENEFICIENT_ID,
      collectorId: COLLECTOR_ID,
      promiseAmount: 500,
      currency: 'MXN',
      method: 'CASH',
      startDate: nextDonationInCurrentMonth,
      recurring: true,
      recurrence: 1,
      isActive: true,
      reasonDeactivate: null,
      createdBy: USER_ID,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      lastDonation: null,
      nextDonation: nextDonationInCurrentMonth,
      chainValidator: 'existing-chain',
    };

    const { handler, receiptRepository, promiseDonationRepository } =
      makeHandlerDeps({
        searchWithActiveAssignments: jest.fn().mockResolvedValue([promiseRow]),
        receiptExists: false,
      });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(receiptRepository.save).toHaveBeenCalledTimes(1);
    expect(promiseDonationRepository.save).toHaveBeenCalledTimes(1);
  });

  it('no debería crear un recibo si ya existe para ese mes', async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextDonationInCurrentMonth = new Date(currentYear, now.getMonth(), 1);

    const promiseRow = {
      id: PROMISE_ID,
      beneficientId: BENEFICIENT_ID,
      collectorId: COLLECTOR_ID,
      promiseAmount: 500,
      currency: 'MXN',
      method: 'CASH',
      startDate: nextDonationInCurrentMonth,
      recurring: true,
      recurrence: 1,
      isActive: true,
      reasonDeactivate: null,
      createdBy: USER_ID,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      lastDonation: null,
      nextDonation: nextDonationInCurrentMonth,
      chainValidator: 'existing-chain',
    };

    const { handler, receiptRepository } = makeHandlerDeps({
      searchWithActiveAssignments: jest.fn().mockResolvedValue([promiseRow]),
      receiptExists: true,
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(receiptRepository.save).not.toHaveBeenCalled();
  });
});
