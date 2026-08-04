import { RegisterCollectorPaymentHandler } from './register-collector-payment.handler';
import { RegisterCollectorPaymentCommand } from '@/donation/application/command/register-collector-payment.command';
import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';
const SETTLEMENT_ID = '01907c2a-0000-7000-8000-000000000020';
const REGISTERED_BY = '01907c2a-0000-7000-8000-000000000030';

function makeSettlement(
  netCommission = 200,
  totalPaid = 0,
  status = CollectorSettlementPaymentStatus.PENDING,
): CollectorSettlement {
  return CollectorSettlement.recreate({ unpack: () => SETTLEMENT_ID } as any, {
    collectionPeriodId: PERIOD_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    month: 6,
    year: 2026,
    totalCollected: 2000,
    collectedByCurrency: { MXN: 2000 },
    commissionPercent: 10,
    commissionAmount: 200,
    nomina: 50,
    transportAllowance: 50,
    netCommission,
    paymentStatus: status,
    totalPaid,
    createdAt: new Date(),
  });
}

function makeCommand(amount = 100): RegisterCollectorPaymentCommand {
  return new RegisterCollectorPaymentCommand(
    SETTLEMENT_ID,
    amount,
    CollectorPaymentMethod.CASH,
    new Date(),
    REGISTERED_BY,
  );
}

describe('RegisterCollectorPaymentHandler', () => {
  let handler: RegisterCollectorPaymentHandler;
  let settlementRepository: { findById: jest.Mock; save: jest.Mock };
  let paymentRepository: { save: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  beforeEach(() => {
    settlementRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    paymentRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    uow = {
      runInTransaction: jest
        .fn()
        .mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new RegisterCollectorPaymentHandler(
      settlementRepository as any,
      paymentRepository as any,
      uow as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando no existe la liquidación', async () => {
    settlementRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con CONFLICT cuando la liquidación ya está pagada', async () => {
    settlementRepository.findById.mockResolvedValue(
      makeSettlement(200, 200, CollectorSettlementPaymentStatus.PAID),
    );

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería fallar con CONFLICT cuando el monto supera el saldo restante', async () => {
    settlementRepository.findById.mockResolvedValue(makeSettlement(200, 150));

    const result = await handler.execute(makeCommand(100));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería registrar el pago y devolver la respuesta en el caso exitoso', async () => {
    const settlement = makeSettlement(200, 0);
    settlementRepository.findById.mockResolvedValue(settlement);

    const result = await handler.execute(makeCommand(100));

    expect(result.isSuccess).toBe(true);
    expect(result.value.amount).toBe(100);
    expect(result.value.collectorId).toBe(COLLECTOR_ID);
    expect(result.value.registeredBy).toBe(REGISTERED_BY);
    expect(paymentRepository.save).toHaveBeenCalledTimes(1);
    expect(settlementRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería actualizar el totalPaid del settlement', async () => {
    const settlement = makeSettlement(200, 0);
    settlementRepository.findById.mockResolvedValue(settlement);

    await handler.execute(makeCommand(80));

    expect(settlement.totalPaid).toBe(80);
    expect(settlement.paymentStatus).toBe(
      CollectorSettlementPaymentStatus.PARTIALLY_PAID,
    );
  });

  it('debería ejecutar la persistencia dentro de una transacción', async () => {
    const settlement = makeSettlement(200, 0);
    settlementRepository.findById.mockResolvedValue(settlement);

    await handler.execute(makeCommand(50));

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
  });
});
