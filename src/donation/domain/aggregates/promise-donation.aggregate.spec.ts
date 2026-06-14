import { PromiseDonation } from './promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const BID = '01907c2a-0000-7000-8000-000000000010';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000020';

function makePromise(overrides: Partial<{
  nextDonation: Date;
  lastDonation: Date;
  startDate: Date;
  recurrence: number;
  isActive: boolean;
}> = {}): PromiseDonation {
  const now = new Date();
  const startDate = overrides.startDate ?? new Date(now.getFullYear(), now.getMonth(), 1);
  return PromiseDonation.recreate('01907c2a-0000-7000-8000-000000000001', {
    beneficientId: BeneficientId.of(BID),
    promiseAmount: 100,
    currency: 'MXN',
    method: 'CASH',
    startDate,
    recurring: true,
    recurrence: overrides.recurrence ?? 1,
    isActive: overrides.isActive ?? true,
    createdBy: UserId.of(CREATED_BY),
    createdAt: now,
    updatedAt: now,
    lastDonation: overrides.lastDonation ?? null,
    nextDonation: overrides.nextDonation ?? startDate,
    reasonDeactivate: null,
  });
}

describe('PromiseDonation', () => {
  describe('deactivate()', () => {
    it('debería marcar la promesa como inactiva con la razón dada', () => {
      const promise = makePromise();

      promise.deactivate('Baja voluntaria');

      expect(promise.isActive).toBe(false);
      expect(promise.reasonDeactivate).toBe('Baja voluntaria');
    });

    it('debería limpiar startDate y nextDonation al desactivar', () => {
      const promise = makePromise();

      promise.deactivate('Motivo');

      expect(promise.startDate).toBeNull();
      expect(promise.nextDonation).toBeNull();
    });
  });

  describe('advanceNextDonationIfStale()', () => {
    it('debería avanzar nextDonation cuando está en el pasado', () => {
      const pastDate = new Date('2020-01-15');
      const promise = makePromise({
        nextDonation: pastDate,
        startDate: pastDate,
        recurrence: 1,
      });

      promise.advanceNextDonationIfStale();

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      expect(promise.nextDonation.getTime()).toBeGreaterThanOrEqual(
        currentMonthStart.getTime(),
      );
    });

    it('no debería modificar nextDonation cuando ya está en el mes actual o futuro', () => {
      const futureDate = new Date('2099-06-15');
      const promise = makePromise({ nextDonation: futureDate, startDate: futureDate });
      const beforeCall = promise.nextDonation.getTime();

      promise.advanceNextDonationIfStale();

      expect(promise.nextDonation.getTime()).toBe(beforeCall);
    });

    it('debería retornar sin cambios si nextDonation es null', () => {
      const now = new Date();
      const promise = PromiseDonation.recreate('01907c2a-0000-7000-8000-000000000001', {
        beneficientId: BeneficientId.of(BID),
        promiseAmount: 100,
        currency: 'MXN',
        method: 'CASH',
        startDate: null,
        recurring: true,
        recurrence: 1,
        isActive: false,
        createdBy: UserId.of(CREATED_BY),
        createdAt: now,
        updatedAt: now,
        lastDonation: null,
        nextDonation: null,
        reasonDeactivate: 'Baja',
      });

      expect(() => promise.advanceNextDonationIfStale()).not.toThrow();
      expect(promise.nextDonation).toBeNull();
    });

    it('debería actualizar lastDonation al avanzar', () => {
      const pastDate = new Date('2020-01-15');
      const promise = makePromise({
        nextDonation: pastDate,
        startDate: pastDate,
        recurrence: 1,
      });

      promise.advanceNextDonationIfStale();

      expect(promise.lastDonation).not.toBeNull();
    });

    it('debería avanzar múltiples meses hasta alcanzar el mes actual', () => {
      const veryOldDate = new Date('2018-01-15');
      const promise = makePromise({
        nextDonation: veryOldDate,
        startDate: veryOldDate,
        recurrence: 1,
      });

      promise.advanceNextDonationIfStale();

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      expect(promise.nextDonation.getTime()).toBeGreaterThanOrEqual(currentMonthStart.getTime());
      expect(promise.nextDonation.getTime()).toBeLessThan(nextMonthStart.getTime());
    });
  });

  describe('updateNextDonation()', () => {
    it('debería añadir los meses de recurrencia a lastDonation', () => {
      const startDate = new Date('2026-01-15');
      const lastDonation = new Date('2026-01-15');
      const promise = makePromise({ startDate, lastDonation, recurrence: 3 });

      promise.updateNextDonation();

      expect(promise.nextDonation.getMonth()).toBe(3);
      expect(promise.nextDonation.getFullYear()).toBe(2026);
    });
  });
});
