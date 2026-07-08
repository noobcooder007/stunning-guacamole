import { CollectorMapper, ICollectorPersistence } from './collector.mapper';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';
const PROFILE_ID = '01907c2a-0000-7000-8000-000000000003';

function makeProfile(): Profile {
  return Profile.recreate(PROFILE_ID, {
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: 'García',
    address: Address.of({
      street: 'Calle Principal',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'addr-hash',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'phone-hash',
    createdAt: new Date('2026-01-01'),
  });
}

function makeDomainCollector(withTelephone = false): Collector {
  return Collector.recreate(COLLECTOR_ID, {
    userId: UserId.of(USER_ID),
    profileId: makeProfile()._id,
    profile: makeProfile(),
    nss: NSS.of('12345678901'),
    nssHash: 'nss-hash',
    telephoneNumber: withTelephone ? PhoneNumber.of('5598765432') : null,
    telephoneNumberHash: withTelephone ? 'tel-hash' : null,
    paymentData: PaymentData.of({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'REF001',
      nomina: 100,
      transportAllowance: 50,
    }),
    notes: 'Nota de prueba',
    profilePath: '/profiles/pic.jpg',
    assignations: new Set(),
    isActive: true,
    createdAt: new Date('2026-01-01'),
    collectorNumber: 7,
  });
}

const validRaw: ICollectorPersistence = {
  id: COLLECTOR_ID,
  profileId: PROFILE_ID,
  userId: USER_ID,
  nss: '12345678901',
  nssHash: 'nss-hash',
  commissionPercent: 10,
  nomina: 100,
  transportAllowance: 50,
  bank: 'BBVA',
  reference: 'REF001',
  notes: 'Nota',
  createdAt: new Date('2026-01-01'),
  isActive: true,
  assignations: [],
  profilePath: '/profiles/pic.jpg',
  collectorNumber: 7,
};

describe('CollectorMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear el agregado al objeto de persistencia', () => {
      const raw = CollectorMapper.toPersistence(makeDomainCollector());

      expect(raw.id).toBe(COLLECTOR_ID);
      expect(raw.userId).toBe(USER_ID);
      expect(raw.profileId).toBe(PROFILE_ID);
      expect(raw.nss).toBe('12345678901');
      expect(raw.commissionPercent).toBe(10);
      expect(raw.bank).toBe('BBVA');
      expect(raw.isActive).toBe(true);
    });

    it('debería incluir telephoneNumber cuando existe', () => {
      const raw = CollectorMapper.toPersistence(makeDomainCollector(true));

      expect(raw.telephoneNumber).toBe('5598765432');
    });

    it('debería dejar telephoneNumber undefined cuando no existe', () => {
      const raw = CollectorMapper.toPersistence(makeDomainCollector(false));

      expect(raw.telephoneNumber).toBeUndefined();
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir el agregado desde el objeto de persistencia y el profile', () => {
      const collector = CollectorMapper.toDomain(validRaw, makeProfile());

      expect(collector._id.unpack()).toBe(COLLECTOR_ID);
      expect(collector.profileId.unpack()).toBe(PROFILE_ID);
      expect(collector.profile.firstname).toBe('Juan');
      expect(collector.nss.unpack()).toBe('12345678901');
      expect(collector.paymentData.commissionPercent).toBe(10);
      expect(collector.isActive).toBe(true);
    });

    it('debería reconstruir assignations como Set', () => {
      const AID = '01907c2a-0000-7000-8000-000000000010';
      const raw: ICollectorPersistence = {
        ...validRaw,
        assignations: [
          {
            id: AID,
            collectorId: COLLECTOR_ID,
            beneficientId: '01907c2a-0000-7000-8000-000000000030',
            reasonDeactivated: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      const collector = CollectorMapper.toDomain(raw, makeProfile());

      expect(collector.assignations.size).toBe(1);
    });

    it('debería usar Set vacío cuando no hay assignations', () => {
      const collector = CollectorMapper.toDomain(
        { ...validRaw, assignations: [] },
        makeProfile(),
      );

      expect(collector.assignations.size).toBe(0);
    });

    it('debería mapear telephoneNumber cuando está presente', () => {
      const raw = { ...validRaw, telephoneNumber: '5598765432' };
      const collector = CollectorMapper.toDomain(raw, makeProfile());

      expect(collector.telephoneNumber?.unpack()).toBe('5598765432');
    });

    it('debería dejar telephoneNumber como null cuando no está presente', () => {
      const collector = CollectorMapper.toDomain(validRaw, makeProfile());

      expect(collector.telephoneNumber).toBeNull();
    });
  });

  describe('fromDomainToResponse()', () => {
    it('debería mapear el agregado a la respuesta REST', () => {
      const response = CollectorMapper.fromDomainToResponse(
        makeDomainCollector(),
      );

      expect(response.id).toBe(COLLECTOR_ID);
      expect(response.firstname).toBe('Juan');
      expect(response.address.street).toBe('Calle Principal');
      expect(response.address.city).toBe('CDMX');
      expect(response.paymentData.commissionPercent).toBe(10);
      expect(response.paymentData.bank).toBe('BBVA');
      expect(response.isActive).toBe(true);
    });

    it('debería mapear telephoneNumber como null cuando no existe', () => {
      const response = CollectorMapper.fromDomainToResponse(
        makeDomainCollector(false),
      );

      expect(response.telephoneNumber).toBeNull();
    });

    it('debería mapear telephoneNumber cuando existe', () => {
      const response = CollectorMapper.fromDomainToResponse(
        makeDomainCollector(true),
      );

      expect(response.telephoneNumber).toBe('5598765432');
    });
  });
});
