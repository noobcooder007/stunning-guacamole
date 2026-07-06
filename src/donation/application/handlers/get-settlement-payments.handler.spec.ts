import { GetSettlementPaymentsHandler } from './get-settlement-payments.handler';
import { GetSettlementPaymentsQuery } from '@/donation/application/query/get-settlement-payments.query';
import {
  CollectorPayment,
  CollectorPaymentMethod,
} from '@/donation/domain/entities/collector-payment.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const SETTLEMENT_ID = '01907c2a-0000-7000-8000-000000000010';
const REGISTERED_BY = '01907c2a-0000-7000-8000-000000000020';

function makePayment(amount = 100): CollectorPayment {
  return CollectorPayment.create({
    settlementId: SETTLEMENT_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    amount,
    paymentMethod: CollectorPaymentMethod.CASH,
    reference: 'REF-001',
    notes: null,
    paidAt: new Date('2026-06-10'),
    registeredBy: UserId.of(REGISTERED_BY),
    createdAt: new Date(),
  });
}

describe('GetSettlementPaymentsHandler', () => {
  let handler: GetSettlementPaymentsHandler;
  let paymentRepository: { findBySettlementId: jest.Mock };

  beforeEach(() => {
    paymentRepository = { findBySettlementId: jest.fn() };
    handler = new GetSettlementPaymentsHandler(paymentRepository as any);
  });

  it('debería devolver lista vacía cuando no hay pagos para la liquidación', async () => {
    paymentRepository.findBySettlementId.mockResolvedValue([]);
    const query = new GetSettlementPaymentsQuery(SETTLEMENT_ID);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it('debería mapear los pagos al DTO de respuesta', async () => {
    const payment = makePayment(150);
    paymentRepository.findBySettlementId.mockResolvedValue([payment]);
    const query = new GetSettlementPaymentsQuery(SETTLEMENT_ID);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(1);
    const dto = result.value[0];
    expect(dto.settlementId).toBe(SETTLEMENT_ID);
    expect(dto.collectorId).toBe(COLLECTOR_ID);
    expect(dto.amount).toBe(150);
    expect(dto.paymentMethod).toBe(CollectorPaymentMethod.CASH);
    expect(dto.reference).toBe('REF-001');
    expect(dto.registeredBy).toBe(REGISTERED_BY);
  });

  it('debería consultar el repositorio con el settlementId de la query', async () => {
    paymentRepository.findBySettlementId.mockResolvedValue([]);
    const query = new GetSettlementPaymentsQuery(SETTLEMENT_ID);

    await handler.execute(query);

    expect(paymentRepository.findBySettlementId).toHaveBeenCalledWith(
      SETTLEMENT_ID,
    );
  });

  it('debería mapear notes null correctamente', async () => {
    paymentRepository.findBySettlementId.mockResolvedValue([makePayment(50)]);
    const query = new GetSettlementPaymentsQuery(SETTLEMENT_ID);

    const result = await handler.execute(query);

    expect(result.value[0].notes).toBeNull();
  });
});
