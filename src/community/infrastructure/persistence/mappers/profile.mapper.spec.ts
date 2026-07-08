import { ProfileMapper, IProfilePersistence } from './profile.mapper';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';

const PROFILE_ID = '01907c2a-0000-7000-8000-000000000001';

function makeDomainProfile(): Profile {
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

const validRaw: IProfilePersistence = {
  id: PROFILE_ID,
  firstname: 'Juan',
  firstLastname: 'Pérez',
  secondLastname: 'García',
  street: 'Calle Principal',
  noExt: '10',
  noInt: null,
  neighborhood: 'Centro',
  city: 'CDMX',
  state: 'CDMX',
  zipCode: '06600',
  addressHash: 'addr-hash',
  phoneNumber: '5512345678',
  phoneNumberHash: 'phone-hash',
  createdAt: new Date('2026-01-01'),
};

describe('ProfileMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear el agregado al objeto de persistencia', () => {
      const raw = ProfileMapper.toPersistence(makeDomainProfile());

      expect(raw.id).toBe(PROFILE_ID);
      expect(raw.firstname).toBe('Juan');
      expect(raw.firstLastname).toBe('Pérez');
      expect(raw.street).toBe('Calle Principal');
      expect(raw.city).toBe('CDMX');
      expect(raw.phoneNumber).toBe('5512345678');
      expect(raw.addressHash).toBe('addr-hash');
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir el agregado desde el objeto de persistencia', () => {
      const profile = ProfileMapper.toDomain(validRaw);

      expect(profile._id.unpack()).toBe(PROFILE_ID);
      expect(profile.firstname).toBe('Juan');
      expect(profile.address.city).toBe('CDMX');
      expect(profile.phoneNumber.unpack()).toBe('5512345678');
      expect(profile.addressHash).toBe('addr-hash');
    });
  });
});
