import { RegisterBulkCollectorPaymentsHandler } from './register-bulk-collector-payments.handler';
import { RegisterBulkCollectorPaymentsCommand } from '@/donation/application/command/register-bulk-collector-payments.command';
import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';
const REGISTERED_BY = '01907c2a-0000-7000-8000-000000000030';

function makeSettlement(netCommission: number, totalPaid = 0): CollectorSettlement {
  return CollectorSettlement.create({
    collectionPeriodId: PERIOD_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    month: 6,
    year: 2026,
    totalCollected: 1000,
    commissionPercent: 10,
    commissionAmount: 100,
    nomina: 0,
    transportAllowance: 0,
    netCommission,
    paymentStatus: CollectorSettlementPaymentStatus.PENDING,
    totalPaid,
    createdAt: new Date(),
  });
}

function makeCommand(): RegisterBulkCollectorPaymentsCommand {
  return new RegisterBulkCollectorPaymentsCommand(
    PERIOD_ID,
    CollectorPaymentMethod.TRANSFER,
    new Date(),
    REGISTERED_BY,
    'REF-BULK',
  );
}

describe('RegisterBulkCollectorPaymentsHandler', () => {
  let handler: RegisterBulkCollectorPaymentsHandler;
  let settlementRepository: { findPendingByPeriodId: jest.Mock; save: jest.Mock };
  let paymentRepository: { saveMany: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  beforeEach(() => {
    settlementRepository = {
      findPendingByPeriodId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    paymentRepository = {
      saveMany: jest.fn().mockResolvedValue(undefined),
    };
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new RegisterBulkCollectorPaymentsHandler(
      settlementRepository as any,
      paymentRepository as any,
      uow as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando no hay liquidaciones pendientes', async () => {
    settlementRepository.findPendingByPeriodId.mockResolvedValue([]);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería crear pagos y guardarlos en el caso exitoso', async () => {
    const settlements = [makeSettlement(100, 0), makeSettlement(150, 0)];
    settlementRepository.findPendingByPeriodId.mockResolvedValue(settlements);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.paid).toBe(2);
    expect(result.value.skipped).toBe(0);
    expect(paymentRepository.saveMany).toHaveBeenCalledTimes(1);
  });

  it('debería omitir liquidaciones con saldo cero o negativo', async () => {
    const settlements = [
      makeSettlement(100, 100),
      makeSettlement(50, 0),
    ];
    settlementRepository.findPendingByPeriodId.mockResolvedValue(settlements);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.paid).toBe(1);
    expect(result.value.skipped).toBe(1);
  });

  it('debería actualizar totalPaid de cada settlement', async () => {
    const s1 = makeSettlement(100, 0);
    const s2 = makeSettlement(200, 0);
    settlementRepository.findPendingByPeriodId.mockResolvedValue([s1, s2]);

    await handler.execute(makeCommand());

    expect(s1.totalPaid).toBe(100);
    expect(s2.totalPaid).toBe(200);
  });

  it('debería ejecutar la persistencia dentro de una transacción', async () => {
    settlementRepository.findPendingByPeriodId.mockResolvedValue([makeSettlement(100)]);

    await handler.execute(makeCommand());

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('debería guardar cada settlement individualmente en la transacción', async () => {
    const settlements = [makeSettlement(100), makeSettlement(200)];
    settlementRepository.findPendingByPeriodId.mockResolvedValue(settlements);

    await handler.execute(makeCommand());

    expect(settlementRepository.save).toHaveBeenCalledTimes(2);
  });
});
