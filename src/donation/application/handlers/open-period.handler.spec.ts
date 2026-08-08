import { OpenPeriodHandler } from './open-period.handler';
import { OpenPeriodCommand } from '@/donation/application/command/open-period.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000002';

function makePeriod(
  month: number,
  year: number,
  status: 'OPEN' | 'CLOSED' | 'SCHEDULED' = 'OPEN',
) {
  return {
    month,
    year,
    _id: { unpack: () => PERIOD_ID },
    status,
    createdAt: new Date('2026-01-01'),
    createdBy: { unpack: () => USER_ID },
    activate: jest.fn(function (this: any) {
      this.status = 'OPEN';
    }),
  };
}

function makeScheduledReceipt(status: 'SCHEDULED' | 'PENDING' = 'SCHEDULED') {
  return {
    status,
    markAsPending: jest.fn(function (this: any) {
      this.status = 'PENDING';
    }),
  };
}

function makeHandler(
  overrides: {
    findOpen?: jest.Mock;
    findScheduled?: jest.Mock;
    findLastClosed?: jest.Mock;
    findByCollectionPeriodId?: jest.Mock;
  } = {},
) {
  const periodRepo = {
    findOpen: overrides.findOpen ?? jest.fn().mockResolvedValue(null),
    findScheduled: overrides.findScheduled ?? jest.fn().mockResolvedValue(null),
    findLastClosed:
      overrides.findLastClosed ?? jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
  };
  const receiptRepo = {
    findByCollectionPeriodId:
      overrides.findByCollectionPeriodId ?? jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
  };
  const uow = {
    runInTransaction: jest
      .fn()
      .mockImplementation((fn: () => Promise<any>) => fn()),
  };
  return {
    handler: new OpenPeriodHandler(
      periodRepo as any,
      receiptRepo as any,
      uow as any,
    ),
    periodRepo,
    receiptRepo,
    uow,
  };
}

describe('OpenPeriodHandler', () => {
  it('debería fallar con CONFLICT si ya hay un periodo abierto', async () => {
    const { handler } = makeHandler({
      findOpen: jest.fn().mockResolvedValue(makePeriod(5, 2026)),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería fallar con NOT_FOUND si no hay periodo cerrado anterior ni programado', async () => {
    const { handler } = makeHandler({
      findOpen: jest.fn().mockResolvedValue(null),
      findScheduled: jest.fn().mockResolvedValue(null),
      findLastClosed: jest.fn().mockResolvedValue(null),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería abrir el mes siguiente al último periodo cerrado cuando no hay SCHEDULED', async () => {
    const { handler, periodRepo } = makeHandler({
      findLastClosed: jest.fn().mockResolvedValue(makePeriod(5, 2026)),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(true);
    expect(result.value.month).toBe(6);
    expect(result.value.year).toBe(2026);
    // Guarda el periodo recién abierto + el nuevo SCHEDULED siguiente.
    expect(periodRepo.save).toHaveBeenCalledTimes(2);
  });

  it('debería pasar a enero del año siguiente cuando el último periodo fue diciembre', async () => {
    const { handler } = makeHandler({
      findLastClosed: jest.fn().mockResolvedValue(makePeriod(12, 2025)),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(true);
    expect(result.value.month).toBe(1);
    expect(result.value.year).toBe(2026);
  });

  it('debería promover un periodo SCHEDULED existente en vez de crear uno nuevo', async () => {
    const scheduled = makePeriod(6, 2026, 'SCHEDULED');
    const { handler, periodRepo, receiptRepo } = makeHandler({
      findScheduled: jest.fn().mockResolvedValue(scheduled),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(true);
    expect(scheduled.activate).toHaveBeenCalledTimes(1);
    expect(result.value.month).toBe(6);
    expect(result.value.year).toBe(2026);
    expect(periodRepo.save).toHaveBeenCalledTimes(2);
    expect(receiptRepo.findByCollectionPeriodId).toHaveBeenCalledWith(
      PERIOD_ID,
    );
  });

  it('debería activar (markAsPending) los recibos SCHEDULED del periodo promovido', async () => {
    const scheduled = makePeriod(6, 2026, 'SCHEDULED');
    const scheduledReceipt = makeScheduledReceipt('SCHEDULED');
    const pendingReceipt = makeScheduledReceipt('PENDING');
    const { handler, receiptRepo } = makeHandler({
      findScheduled: jest.fn().mockResolvedValue(scheduled),
      findByCollectionPeriodId: jest
        .fn()
        .mockResolvedValue([scheduledReceipt, pendingReceipt]),
    });

    await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(scheduledReceipt.markAsPending).toHaveBeenCalledTimes(1);
    expect(pendingReceipt.markAsPending).not.toHaveBeenCalled();
    expect(receiptRepo.save).toHaveBeenCalledWith([scheduledReceipt]);
  });

  it('no debería llamar a save de recibos si el SCHEDULED promovido no tiene recibos', async () => {
    const scheduled = makePeriod(6, 2026, 'SCHEDULED');
    const { handler, receiptRepo } = makeHandler({
      findScheduled: jest.fn().mockResolvedValue(scheduled),
      findByCollectionPeriodId: jest.fn().mockResolvedValue([]),
    });

    await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(receiptRepo.save).not.toHaveBeenCalled();
  });
});
