import {
  CollectorSettlementMapper,
  ICollectorSettlementPersistence,
} from './collector-settlement.mapper';
import {
  CollectorSettlement,
  CollectorSettlementId,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

const SETTLEMENT_ID = '01907c2a-0000-7000-8000-000000000020';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';

function makeSettlement(): CollectorSettlement {
  return CollectorSettlement.recreate(CollectorSettlementId.of(SETTLEMENT_ID), {
    collectionPeriodId: PERIOD_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    month: 6,
    year: 2026,
    totalCollected: 1000,
    commissionPercent: 10,
    commissionAmount: 100,
    nomina: 50,
    transportAllowance: 20,
    netCommission: 70,
    paymentStatus: CollectorSettlementPaymentStatus.PENDING,
    totalPaid: 0,
    createdAt: new Date('2026-06-01'),
  });
}

const validRaw: ICollectorSettlementPersistence = {
  id: SETTLEMENT_ID,
  collectionPeriodId: PERIOD_ID,
  collectorId: COLLECTOR_ID,
  month: 6,
  year: 2026,
  totalCollected: '1000' as any,
  commissionPercent: 10,
  commissionAmount: '100' as any,
  nomina: '50' as any,
  transportAllowance: '20' as any,
  netCommission: '70' as any,
  paymentStatus: CollectorSettlementPaymentStatus.PENDING,
  totalPaid: '0' as any,
  createdAt: new Date('2026-06-01'),
};

describe('CollectorSettlementMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear el entity al objeto de persistencia', () => {
      const raw = CollectorSettlementMapper.toPersistence(makeSettlement());

      expect(raw.id).toBe(SETTLEMENT_ID);
      expect(raw.collectorId).toBe(COLLECTOR_ID);
      expect(raw.collectionPeriodId).toBe(PERIOD_ID);
      expect(raw.month).toBe(6);
      expect(raw.year).toBe(2026);
      expect(raw.totalCollected).toBe(1000);
      expect(raw.commissionAmount).toBe(100);
      expect(raw.netCommission).toBe(70);
      expect(raw.paymentStatus).toBe(CollectorSettlementPaymentStatus.PENDING);
      expect(raw.totalPaid).toBe(0);
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir el entity desde el objeto de persistencia', () => {
      const settlement = CollectorSettlementMapper.toDomain(validRaw);

      expect(settlement._id.unpack()).toBe(SETTLEMENT_ID);
      expect(settlement.collectorId.unpack()).toBe(COLLECTOR_ID);
      expect(settlement.month).toBe(6);
      expect(settlement.year).toBe(2026);
      expect(settlement.totalCollected).toBe(1000);
      expect(settlement.netCommission).toBe(70);
      expect(settlement.paymentStatus).toBe(
        CollectorSettlementPaymentStatus.PENDING,
      );
    });

    it('debería convertir strings numéricos a Number (valores de DB)', () => {
      const settlement = CollectorSettlementMapper.toDomain(validRaw);

      expect(typeof settlement.totalCollected).toBe('number');
      expect(typeof settlement.commissionAmount).toBe('number');
      expect(typeof settlement.nomina).toBe('number');
      expect(typeof settlement.netCommission).toBe('number');
      expect(typeof settlement.totalPaid).toBe('number');
    });
  });
});
