import {
  CollectorPaymentMapper,
  ICollectorPaymentPersistence,
} from './collector-payment.mapper';
import {
  CollectorPayment,
  CollectorPaymentId,
  CollectorPaymentMethod,
} from '@/donation/domain/entities/collector-payment.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const PAYMENT_ID = '01907c2a-0000-7000-8000-000000000001';
const SETTLEMENT_ID = '01907c2a-0000-7000-8000-000000000002';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000003';
const REGISTERED_BY = '01907c2a-0000-7000-8000-000000000004';

function makeDomainPayment(): CollectorPayment {
  return CollectorPayment.recreate(CollectorPaymentId.of(PAYMENT_ID), {
    settlementId: SETTLEMENT_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    amount: 150,
    paymentMethod: CollectorPaymentMethod.TRANSFER,
    reference: 'TXN-001',
    notes: 'Pago junio',
    paidAt: new Date('2026-06-10'),
    registeredBy: UserId.of(REGISTERED_BY),
    createdAt: new Date('2026-06-10'),
  });
}

const validRaw: ICollectorPaymentPersistence = {
  id: PAYMENT_ID,
  settlementId: SETTLEMENT_ID,
  collectorId: COLLECTOR_ID,
  amount: '150' as any,
  paymentMethod: CollectorPaymentMethod.TRANSFER,
  reference: 'TXN-001',
  notes: null,
  paidAt: new Date('2026-06-10'),
  registeredBy: REGISTERED_BY,
  createdAt: new Date('2026-06-10'),
};

describe('CollectorPaymentMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear el pago al objeto de persistencia', () => {
      const raw = CollectorPaymentMapper.toPersistence(makeDomainPayment());
      expect(raw.id).toBe(PAYMENT_ID);
      expect(raw.settlementId).toBe(SETTLEMENT_ID);
      expect(raw.collectorId).toBe(COLLECTOR_ID);
      expect(raw.amount).toBe(150);
      expect(raw.paymentMethod).toBe(CollectorPaymentMethod.TRANSFER);
      expect(raw.reference).toBe('TXN-001');
      expect(raw.registeredBy).toBe(REGISTERED_BY);
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir el pago desde persistencia', () => {
      const payment = CollectorPaymentMapper.toDomain(validRaw);
      expect(payment._id.unpack()).toBe(PAYMENT_ID);
      expect(payment.settlementId).toBe(SETTLEMENT_ID);
      expect(payment.collectorId.unpack()).toBe(COLLECTOR_ID);
      expect(payment.amount).toBe(150);
      expect(payment.paymentMethod).toBe(CollectorPaymentMethod.TRANSFER);
      expect(payment.registeredBy.unpack()).toBe(REGISTERED_BY);
    });

    it('debería convertir amount string a número (valor de DB)', () => {
      const payment = CollectorPaymentMapper.toDomain(validRaw);
      expect(typeof payment.amount).toBe('number');
    });

    it('debería preservar notes null', () => {
      const payment = CollectorPaymentMapper.toDomain(validRaw);
      expect(payment.notes).toBeNull();
    });
  });
});
