import { GenerateRecurringReceiptsHandler } from './generate-recurring-receipts.handler';
import { GenerateRecurringReceiptsCommand } from '@/donation/application/command/generate-recurring-receipts.command';
import { ReceiptFolio } from '@/donation/domain/aggregates/receipt.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const OPEN_PERIOD_ID = '01907c2a-0000-7000-8000-000000000002';
const SCHEDULED_PERIOD_ID = '01907c2a-0000-7000-8000-000000000006';
const PROMISE_ID = '01907c2a-0000-7000-8000-000000000003';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000004';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000005';

const OPEN_PERIOD = {
  month: 6,
  year: 2026,
  _id: { unpack: () => OPEN_PERIOD_ID },
};

const SCHEDULED_PERIOD = {
  month: 7,
  year: 2026,
  _id: { unpack: () => SCHEDULED_PERIOD_ID },
};

function makePromiseRow(overrides: Partial<any> = {}) {
  return {
    id: PROMISE_ID,
    beneficientId: BENEFICIENT_ID,
    collectorId: COLLECTOR_ID,
    promiseAmount: 500,
    currency: 'MXN',
    method: 'CASH',
    startDate: new Date('2026-01-01'),
    recurring: true,
    recurrence: 1,
    isActive: true,
    reasonDeactivate: null,
    createdBy: USER_ID,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    lastDonation: null,
    nextDonation: new Date(2026, 5, 1), // JUN 2026
    chainValidator: 'existing-chain',
    ...overrides,
  };
}

function makeHandlerDeps(
  overrides: {
    findOpen?: jest.Mock;
    findScheduled?: jest.Mock;
    searchWithActiveAssignments?: jest.Mock;
    receiptExists?: boolean;
  } = {},
) {
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
    findOpen: overrides.findOpen ?? jest.fn().mockResolvedValue(OPEN_PERIOD),
    findScheduled: overrides.findScheduled ?? jest.fn().mockResolvedValue(null),
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
    periodRepository,
    folioProvider,
  };
}

describe('GenerateRecurringReceiptsHandler', () => {
  it('debería fallar con NOT_FOUND si no hay periodo abierto (target OPEN por defecto)', async () => {
    const { handler } = makeHandlerDeps({
      findOpen: jest.fn().mockResolvedValue(null),
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con NOT_FOUND si se pide SCHEDULED y no existe uno programado', async () => {
    const { handler } = makeHandlerDeps({
      findScheduled: jest.fn().mockResolvedValue(null),
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID, 'SCHEDULED'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería tener éxito contra el periodo abierto cuando no hay promesas', async () => {
    const { handler } = makeHandlerDeps();

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
  });

  it('debería generar recibos por las promesas cuya nextDonation cae en el periodo abierto', async () => {
    const { handler, receiptRepository, promiseDonationRepository } =
      makeHandlerDeps({
        searchWithActiveAssignments: jest
          .fn()
          .mockResolvedValue([makePromiseRow()]),
      });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(receiptRepository.save).toHaveBeenCalledTimes(1);
    expect(promiseDonationRepository.save).toHaveBeenCalledTimes(1);
    const savedReceipt = receiptRepository.save.mock.calls[0][0];
    expect(savedReceipt.status).toBe('PENDING');
  });

  it('no debería crear un recibo si ya existe para ese mes', async () => {
    const { handler, receiptRepository } = makeHandlerDeps({
      searchWithActiveAssignments: jest
        .fn()
        .mockResolvedValue([makePromiseRow()]),
      receiptExists: true,
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(receiptRepository.save).not.toHaveBeenCalled();
  });

  it('debería generar recibos SCHEDULED contra el periodo programado cuando se pide explícitamente', async () => {
    const promiseRow = makePromiseRow({
      nextDonation: new Date(2026, 6, 1), // JUL 2026, coincide con SCHEDULED_PERIOD
    });
    const { handler, receiptRepository, periodRepository } = makeHandlerDeps({
      findScheduled: jest.fn().mockResolvedValue(SCHEDULED_PERIOD),
      searchWithActiveAssignments: jest.fn().mockResolvedValue([promiseRow]),
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID, 'SCHEDULED'),
    );

    expect(result.isSuccess).toBe(true);
    // La búsqueda de promesas usa el mes/año del periodo SCHEDULED, no OPEN.
    expect(periodRepository.findScheduled).toHaveBeenCalled();
    const savedReceipt = receiptRepository.save.mock.calls[0][0];
    expect(savedReceipt.status).toBe('SCHEDULED');
    expect(savedReceipt.collectionPeriodId).toBe(SCHEDULED_PERIOD_ID);
  });

  it('debería asignar el collectionPeriodId correcto por recibo cuando hay rezago entre OPEN y SCHEDULED', async () => {
    // La promesa debe un recibo de JUN (OPEN) y otro de JUL (SCHEDULED).
    const promiseRow = makePromiseRow({
      nextDonation: new Date(2026, 5, 1), // JUN 2026
    });
    const { handler, receiptRepository } = makeHandlerDeps({
      findScheduled: jest.fn().mockResolvedValue(SCHEDULED_PERIOD),
      searchWithActiveAssignments: jest.fn().mockResolvedValue([promiseRow]),
    });

    const result = await handler.execute(
      new GenerateRecurringReceiptsCommand(USER_ID, 'SCHEDULED'),
    );

    expect(result.isSuccess).toBe(true);
    expect(receiptRepository.save).toHaveBeenCalledTimes(2);
    const [juneReceipt] = receiptRepository.save.mock.calls[0];
    const [julyReceipt] = receiptRepository.save.mock.calls[1];
    expect(juneReceipt.collectionPeriodId).toBe(OPEN_PERIOD_ID);
    expect(juneReceipt.status).toBe('PENDING');
    expect(julyReceipt.collectionPeriodId).toBe(SCHEDULED_PERIOD_ID);
    expect(julyReceipt.status).toBe('SCHEDULED');
  });
});
