import { ClosePeriodHandler } from './close-period.handler';
import { ClosePeriodCommand } from '@/donation/application/command/close-period.command';
import { CollectorSettlementPaymentStatus } from '@/donation/domain/entities/collector-settlement.entity';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000020';

function makePeriod() {
  return {
    _id: { unpack: () => PERIOD_ID },
    month: 6,
    year: 2026,
    totalCollected: 0,
    totalCommissions: 0,
    totalNet: 0,
    closedAt: new Date(),
    close: jest.fn(),
  };
}

function makeReceipt(collectorId: string, amount: number, status = 'PAID') {
  return {
    status,
    collector: { unpack: () => collectorId },
    amount: { amount },
  };
}

function makeCollector(
  collectorId: string,
  commissionPercent = 10,
  nomina = 0,
  transportAllowance = 0,
) {
  return {
    _id: { unpack: () => collectorId },
    paymentData: { commissionPercent, nomina, transportAllowance },
  };
}

describe('ClosePeriodHandler', () => {
  let handler: ClosePeriodHandler;
  let periodRepository: { findOpen: jest.Mock; save: jest.Mock };
  let settlementRepository: { saveMany: jest.Mock };
  let receiptRepository: { findByCollectionPeriodId: jest.Mock };
  let collectorRepository: { findById: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  const command = new ClosePeriodCommand(USER_ID);

  beforeEach(() => {
    periodRepository = {
      findOpen: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    settlementRepository = {
      saveMany: jest.fn().mockResolvedValue(undefined),
    };
    receiptRepository = {
      findByCollectionPeriodId: jest.fn(),
    };
    collectorRepository = {
      findById: jest.fn(),
    };
    uow = {
      runInTransaction: jest
        .fn()
        .mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new ClosePeriodHandler(
      periodRepository as any,
      settlementRepository as any,
      receiptRepository as any,
      collectorRepository as any,
      uow as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando no hay período abierto', async () => {
    periodRepository.findOpen.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería cerrar el período sin liquidaciones cuando no hay recibos pagados', async () => {
    const period = makePeriod();
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.settlements).toHaveLength(0);
    expect(period.close).toHaveBeenCalledTimes(1);
    expect(settlementRepository.saveMany).not.toHaveBeenCalled();
  });

  it('debería ignorar recibos con status distinto a PAID', async () => {
    const period = makePeriod();
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID, 500, 'PENDING'),
      makeReceipt(COLLECTOR_ID, 300, 'REJECTED'),
    ]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.settlements).toHaveLength(0);
  });

  it('debería crear una liquidación por colector con recibos pagados', async () => {
    const period = makePeriod();
    const collector = makeCollector(COLLECTOR_ID, 10, 50, 20);
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID, 1000, 'PAID'),
    ]);
    collectorRepository.findById.mockResolvedValue(collector);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.settlements).toHaveLength(1);
    const settlement = result.value.settlements[0];
    expect(settlement.collectorId).toBe(COLLECTOR_ID);
    expect(settlement.totalCollected).toBe(1000);
    expect(settlement.commissionAmount).toBe(100);
    expect(settlement.paymentStatus).toBe(
      CollectorSettlementPaymentStatus.PENDING,
    );
  });

  it('debería calcular netCommission como commissionAmount - nomina + transportAllowance', async () => {
    const period = makePeriod();
    const collector = makeCollector(COLLECTOR_ID, 10, 50, 20);
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID, 1000, 'PAID'),
    ]);
    collectorRepository.findById.mockResolvedValue(collector);

    const result = await handler.execute(command);

    const settlement = result.value.settlements[0];
    expect(settlement.netCommission).toBe(70);
  });

  it('debería agrupar recibos del mismo colector en una sola liquidación', async () => {
    const C2 = '01907c2a-0000-7000-8000-000000000002';
    const period = makePeriod();
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID, 600, 'PAID'),
      makeReceipt(COLLECTOR_ID, 400, 'PAID'),
      makeReceipt(C2, 500, 'PAID'),
    ]);
    collectorRepository.findById
      .mockResolvedValueOnce(makeCollector(COLLECTOR_ID, 10, 0, 0))
      .mockResolvedValueOnce(makeCollector(C2, 10, 0, 0));

    const result = await handler.execute(command);

    expect(result.value.settlements).toHaveLength(2);
    const s1 = result.value.settlements.find(
      (s) => s.collectorId === COLLECTOR_ID,
    );
    expect(s1.totalCollected).toBe(1000);
  });

  it('debería ignorar recibos pagados que no tienen colector asignado', async () => {
    const period = makePeriod();
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      { status: 'PAID', collector: null, amount: { amount: 500 } },
    ]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.settlements).toHaveLength(0);
  });

  it('debería usar 0 como totalCollected cuando el colector no aparece en el mapa de totales', async () => {
    const OTHER_COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000099';
    const period = makePeriod();
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID, 1000, 'PAID'),
    ]);
    // findById devuelve un colector con un ID diferente al que está en el mapa
    collectorRepository.findById.mockResolvedValue(
      makeCollector(OTHER_COLLECTOR_ID, 10, 0, 0),
    );

    const result = await handler.execute(command);

    const settlement = result.value.settlements[0];
    expect(settlement.totalCollected).toBe(0);
    expect(settlement.commissionAmount).toBe(0);
  });

  it('debería persistir dentro de una transacción', async () => {
    const period = makePeriod();
    const collector = makeCollector(COLLECTOR_ID, 10, 0, 0);
    periodRepository.findOpen.mockResolvedValue(period);
    receiptRepository.findByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID, 1000, 'PAID'),
    ]);
    collectorRepository.findById.mockResolvedValue(collector);

    await handler.execute(command);

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
    expect(settlementRepository.saveMany).toHaveBeenCalledTimes(1);
  });
});
