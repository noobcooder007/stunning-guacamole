import {
  CollectionPeriodMapper,
  ICollectionPeriodPersistence,
} from './collection-period.mapper';
import {
  CollectionPeriod,
  CollectionPeriodId,
} from '@/donation/domain/aggregates/collection-period.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const PERIOD_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';

function makeOpenPeriod(): CollectionPeriod {
  return CollectionPeriod.recreate(CollectionPeriodId.of(PERIOD_ID), {
    month: 6,
    year: 2026,
    status: 'OPEN',
    createdAt: new Date('2026-06-01'),
    createdBy: UserId.of(USER_ID),
  });
}

function makeClosedPeriod(): CollectionPeriod {
  const period = makeOpenPeriod();
  period.close(UserId.of(USER_ID), 5000, 500);
  return period;
}

const rawOpen: ICollectionPeriodPersistence = {
  id: PERIOD_ID,
  month: 6,
  year: 2026,
  status: 'OPEN',
  closedAt: null,
  closedBy: null,
  createdAt: new Date('2026-06-01'),
  createdBy: USER_ID,
  totalCollected: null,
  totalCommissions: null,
  totalNet: null,
};

const rawClosed: ICollectionPeriodPersistence = {
  ...rawOpen,
  status: 'CLOSED',
  closedAt: new Date('2026-06-30'),
  closedBy: USER_ID,
  totalCollected: '5000' as any,
  totalCommissions: '500' as any,
  totalNet: '4500' as any,
};

describe('CollectionPeriodMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear un período OPEN sin cerrar', () => {
      const raw = CollectionPeriodMapper.toPersistence(makeOpenPeriod());
      expect(raw.id).toBe(PERIOD_ID);
      expect(raw.status).toBe('OPEN');
      expect(raw.closedAt).toBeNull();
      expect(raw.closedBy).toBeNull();
      expect(raw.createdBy).toBe(USER_ID);
    });

    it('debería mapear un período CLOSED con totales', () => {
      const raw = CollectionPeriodMapper.toPersistence(makeClosedPeriod());
      expect(raw.status).toBe('CLOSED');
      expect(raw.totalCollected).toBe(5000);
      expect(raw.totalCommissions).toBe(500);
      expect(raw.totalNet).toBe(4500);
      expect(raw.closedBy).toBe(USER_ID);
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir un período OPEN desde persistencia', () => {
      const period = CollectionPeriodMapper.toDomain(rawOpen);
      expect(period._id.unpack()).toBe(PERIOD_ID);
      expect(period.month).toBe(6);
      expect(period.status).toBe('OPEN');
      expect(period.isOpen).toBe(true);
    });

    it('debería reconstruir un período CLOSED con totales numéricos', () => {
      const period = CollectionPeriodMapper.toDomain(rawClosed);
      expect(period.status).toBe('CLOSED');
      expect(period.isOpen).toBe(false);
      expect(typeof period.totalCollected).toBe('number');
      expect(period.totalCollected).toBe(5000);
    });

    it('debería manejar closedBy null correctamente', () => {
      const period = CollectionPeriodMapper.toDomain(rawOpen);
      expect(period.closedBy).toBeUndefined();
    });
  });
});
