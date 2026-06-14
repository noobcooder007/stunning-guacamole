import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from './collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';

function makeSettlement(overrides: Partial<{
  netCommission: number;
  totalPaid: number;
  paymentStatus: CollectorSettlementPaymentStatus;
}> = {}): CollectorSettlement {
  const netCommission = overrides.netCommission ?? 100;
  return CollectorSettlement.create({
    collectionPeriodId: PERIOD_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    month: 6,
    year: 2026,
    totalCollected: 1000,
    commissionPercent: 10,
    commissionAmount: 100,
    nomina: 50,
    transportAllowance: 50,
    netCommission,
    paymentStatus: overrides.paymentStatus ?? CollectorSettlementPaymentStatus.PENDING,
    totalPaid: overrides.totalPaid ?? 0,
    createdAt: new Date(),
  });
}

describe('CollectorSettlement', () => {
  describe('registerPayment()', () => {
    it('debería actualizar totalPaid y cambiar status a PARTIALLY_PAID con pago parcial', () => {
      const settlement = makeSettlement({ netCommission: 100, totalPaid: 0 });

      settlement.registerPayment(60);

      expect(settlement.totalPaid).toBe(60);
      expect(settlement.paymentStatus).toBe(CollectorSettlementPaymentStatus.PARTIALLY_PAID);
    });

    it('debería cambiar status a PAID cuando el monto cubre el total', () => {
      const settlement = makeSettlement({ netCommission: 100, totalPaid: 0 });

      settlement.registerPayment(100);

      expect(settlement.totalPaid).toBe(100);
      expect(settlement.paymentStatus).toBe(CollectorSettlementPaymentStatus.PAID);
    });

    it('debería acumular pagos sucesivos y marcar PAID al completar', () => {
      const settlement = makeSettlement({ netCommission: 100, totalPaid: 40 });

      settlement.registerPayment(60);

      expect(settlement.totalPaid).toBe(100);
      expect(settlement.paymentStatus).toBe(CollectorSettlementPaymentStatus.PAID);
    });

    it('debería lanzar Error cuando el monto supera el saldo restante', () => {
      const settlement = makeSettlement({ netCommission: 100, totalPaid: 80 });

      expect(() => settlement.registerPayment(30)).toThrow();
    });
  });

  describe('remainingBalance', () => {
    it('debería retornar netCommission - totalPaid', () => {
      const settlement = makeSettlement({ netCommission: 100, totalPaid: 30 });

      expect(settlement.remainingBalance).toBe(70);
    });

    it('debería ser cero cuando está totalmente pagado', () => {
      const settlement = makeSettlement({ netCommission: 100, totalPaid: 100 });

      expect(settlement.remainingBalance).toBe(0);
    });

    it('debería redondear correctamente con centavos', () => {
      const settlement = makeSettlement({ netCommission: 100.33, totalPaid: 0 });
      settlement.registerPayment(50.10);

      expect(settlement.remainingBalance).toBeCloseTo(50.23, 2);
    });
  });
});
