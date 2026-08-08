import {
  PromiseDonationMapper,
  IPromiseDonationPersistence,
} from './promise-donation.mapper';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

const PROMISE_ID = '01907c2a-0000-7000-8000-000000000001';
const BID = '01907c2a-0000-7000-8000-000000000010';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000020';

const now = new Date('2026-06-01');

function makeDomainPromise(
  overrides: Partial<{
    startDate: Date;
    isActive: boolean;
  }> = {},
): PromiseDonation {
  return PromiseDonation.recreate(PROMISE_ID, {
    beneficientId: BeneficientId.of(BID),
    promiseAmount: 200,
    currency: 'MXN',
    method: 'CASH',
    startDate: overrides.startDate ?? new Date('2026-01-15'),
    recurring: true,
    recurrence: 1,
    isActive: overrides.isActive ?? true,
    createdBy: UserId.of(CREATED_BY),
    createdAt: now,
    updatedAt: now,
    lastDonation: null,
    nextDonation: new Date('2026-01-15'),
    reasonDeactivate: null,
  });
}

const validRaw: IPromiseDonationPersistence = {
  id: PROMISE_ID,
  beneficientId: BID,
  promiseAmount: 200,
  currency: 'MXN',
  method: 'CASH',
  startDate: new Date('2026-01-15'),
  recurring: true,
  recurrence: 1,
  isActive: true,
  reasonDeactivate: null,
  createdBy: CREATED_BY,
  createdAt: now,
  updatedAt: now,
  lastDonation: null,
  nextDonation: new Date('2026-01-15'),
};

describe('PromiseDonationMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear el agregado al objeto de persistencia', () => {
      const raw = PromiseDonationMapper.toPersistence(makeDomainPromise());

      expect(raw.id).toBe(PROMISE_ID);
      expect(raw.beneficientId).toBe(BID);
      expect(raw.promiseAmount).toBe(200);
      expect(raw.currency).toBe('MXN');
      expect(raw.method).toBe('CASH');
      expect(raw.recurring).toBe(true);
      expect(raw.recurrence).toBe(1);
      expect(raw.isActive).toBe(true);
      expect(raw.createdBy).toBe(CREATED_BY);
    });

    it('debería preservar lastDonation null', () => {
      const raw = PromiseDonationMapper.toPersistence(makeDomainPromise());

      expect(raw.lastDonation).toBeNull();
    });

    it('debería preservar reasonDeactivate null', () => {
      const raw = PromiseDonationMapper.toPersistence(makeDomainPromise());

      expect(raw.reasonDeactivate).toBeNull();
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir el agregado desde el objeto de persistencia', () => {
      const promise = PromiseDonationMapper.toDomain(validRaw);

      expect(promise._id.unpack()).toBe(PROMISE_ID);
      expect(promise.beneficientId.unpack()).toBe(BID);
      expect(promise.promiseAmount).toBe(200);
      expect(promise.currency).toBe('MXN');
      expect(promise.isActive).toBe(true);
      expect(promise.createdBy.unpack()).toBe(CREATED_BY);
    });

    it('debería reconstruir una promesa inactiva', () => {
      const raw = {
        ...validRaw,
        isActive: false,
        reasonDeactivate: 'Baja',
        startDate: null,
      };
      const promise = PromiseDonationMapper.toDomain(raw);

      expect(promise.isActive).toBe(false);
      expect(promise.reasonDeactivate).toBe('Baja');
    });

    it('debería preservar instructions cuando están presentes', () => {
      const instructions = {
        weeklySchedule: [{ day: 'Lunes', hours: '10:00-12:00', note: '' }],
        generalObservations: 'Sin observaciones',
      };
      const raw = { ...validRaw, instructions: instructions };
      const promise = PromiseDonationMapper.toDomain(raw);

      expect(promise.instructions).toEqual(instructions);
    });
  });

  describe('toResponseWithBeneficient()', () => {
    function makeSchema(): any {
      return {
        id: PROMISE_ID,
        beneficient: {
          id: BID,
          beneficientNumber: 12,
          profile: {
            firstname: 'María',
            firstLastname: 'López',
            secondLastname: null,
          },
        },
        promiseAmount: 200,
        currency: 'MXN',
        method: 'CASH',
        startDate: new Date('2026-01-15'),
        recurring: true,
        recurrence: 1,
        lastDonation: null,
        nextDonation: new Date('2026-01-15'),
        isActive: true,
        reasonDeactivate: null,
        createdAt: now,
        updatedAt: now,
        instructions: undefined,
      };
    }

    it('debería incluir el número de colector cuando se provee', () => {
      const response = PromiseDonationMapper.toResponseWithBeneficient(
        makeSchema(),
        7,
      );

      expect(response.collectorNumber).toBe(7);
    });

    it('debería incluir el número de bienhechor', () => {
      const response = PromiseDonationMapper.toResponseWithBeneficient(
        makeSchema(),
      );

      expect(response.beneficient.beneficientNumber).toBe(12);
    });

    it('debería devolver null cuando no se provee número de colector', () => {
      const response =
        PromiseDonationMapper.toResponseWithBeneficient(makeSchema());

      expect(response.collectorNumber).toBeNull();
    });
  });
});
