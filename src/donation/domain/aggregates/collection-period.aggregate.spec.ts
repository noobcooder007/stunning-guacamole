import {
  CollectionPeriod,
  CollectionPeriodId,
} from './collection-period.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';

function makeOpenPeriod(): CollectionPeriod {
  return CollectionPeriod.recreate(CollectionPeriodId.of(PERIOD_ID), {
    month: 6,
    year: 2026,
    status: 'OPEN',
    createdAt: new Date('2026-06-01'),
    createdBy: UserId.of(USER_ID),
  });
}

describe('CollectionPeriod', () => {
  describe('open()', () => {
    it('debería crear un período abierto con mes y año correctos', () => {
      const period = CollectionPeriod.open(6, 2026, UserId.of(USER_ID));

      expect(period.month).toBe(6);
      expect(period.year).toBe(2026);
      expect(period.status).toBe('OPEN');
      expect(period.isOpen).toBe(true);
    });

    it('debería lanzar si month es null', () => {
      expect(() =>
        CollectionPeriod.open(null, 2026, UserId.of(USER_ID)),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar si year es null', () => {
      expect(() => CollectionPeriod.open(6, null, UserId.of(USER_ID))).toThrow(
        InvalidAttributeException,
      );
    });
  });

  describe('close()', () => {
    it('debería cerrar el período y registrar los totales', () => {
      const period = makeOpenPeriod();

      period.close(UserId.of(USER_ID), 5000, 500);

      expect(period.status).toBe('CLOSED');
      expect(period.isOpen).toBe(false);
      expect(period.totalCollected).toBe(5000);
      expect(period.totalCommissions).toBe(500);
      expect(period.totalNet).toBe(4500);
      expect(period.closedAt).toBeDefined();
      expect(period.closedBy.unpack()).toBe(USER_ID);
    });

    it('debería lanzar Error si el período ya está cerrado', () => {
      const period = makeOpenPeriod();
      period.close(UserId.of(USER_ID), 1000, 100);

      expect(() => period.close(UserId.of(USER_ID), 2000, 200)).toThrow(Error);
    });

    it('debería calcular totalNet como totalCollected - totalCommissions', () => {
      const period = makeOpenPeriod();
      period.close(UserId.of(USER_ID), 3000, 300);

      expect(period.totalNet).toBe(2700);
    });

    it('debería registrar el tipo de cambio USD->MXN cuando se provee', () => {
      const period = makeOpenPeriod();
      period.close(UserId.of(USER_ID), 5000, 500, 17.85);

      expect(period.exchangeRateUsdToMxn).toBe(17.85);
    });

    it('debería dejar exchangeRateUsdToMxn indefinido cuando no se provee', () => {
      const period = makeOpenPeriod();
      period.close(UserId.of(USER_ID), 5000, 500);

      expect(period.exchangeRateUsdToMxn).toBeUndefined();
    });
  });

  describe('isOpen', () => {
    it('debería ser true para un período OPEN', () => {
      expect(makeOpenPeriod().isOpen).toBe(true);
    });

    it('debería ser false para un período CLOSED', () => {
      const period = makeOpenPeriod();
      period.close(UserId.of(USER_ID), 0, 0);
      expect(period.isOpen).toBe(false);
    });
  });

  describe('schedule()', () => {
    it('debería crear un período SCHEDULED con mes y año correctos', () => {
      const period = CollectionPeriod.schedule(7, 2026, UserId.of(USER_ID));

      expect(period.month).toBe(7);
      expect(period.year).toBe(2026);
      expect(period.status).toBe('SCHEDULED');
      expect(period.isOpen).toBe(false);
    });

    it('debería lanzar si month es null', () => {
      expect(() =>
        CollectionPeriod.schedule(null, 2026, UserId.of(USER_ID)),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar si year es null', () => {
      expect(() =>
        CollectionPeriod.schedule(7, null, UserId.of(USER_ID)),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('activate()', () => {
    it('debería pasar un período SCHEDULED a OPEN', () => {
      const period = CollectionPeriod.schedule(7, 2026, UserId.of(USER_ID));

      period.activate();

      expect(period.status).toBe('OPEN');
      expect(period.isOpen).toBe(true);
    });

    it('debería preservar month/year/createdAt/createdBy al activar', () => {
      const period = CollectionPeriod.schedule(7, 2026, UserId.of(USER_ID));
      const createdAt = period.createdAt;

      period.activate();

      expect(period.month).toBe(7);
      expect(period.year).toBe(2026);
      expect(period.createdAt).toBe(createdAt);
      expect(period.createdBy.unpack()).toBe(USER_ID);
    });

    it('debería lanzar Error si el período no está SCHEDULED', () => {
      const period = makeOpenPeriod();

      expect(() => period.activate()).toThrow(Error);
    });
  });
});
