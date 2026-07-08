import { Profile } from './profile.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import {
  UpdateProfileAddressCommand,
  UpdateProfileContactCommand,
  UpdateProfilePersonalCommand,
} from '@/community/application/command/update-profile.command';

const PROFILE_ID = '01907c2a-0000-7000-8000-000000000001';

function makeAddress() {
  return Address.of({
    street: 'Calle Falsa',
    numeration: Numeration.of({ noExt: '123', noInt: null }),
    neighborhood: 'Centro',
    city: 'CDMX',
    state: 'CDMX',
    zipCode: ZipCode.of('06600'),
  });
}

function makeProfile() {
  return Profile.recreate(PROFILE_ID, {
    firstname: 'Juan',
    firstLastname: 'García',
    secondLastname: null,
    address: makeAddress(),
    addressHash: 'hash-addr',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'hash-phone',
    createdAt: new Date('2026-01-01'),
  });
}

describe('Profile', () => {
  describe('update()', () => {
    it('debería actualizar datos personales con UpdateProfilePersonalCommand', () => {
      const profile = makeProfile();
      const cmd = new UpdateProfilePersonalCommand(
        PROFILE_ID,
        'Pedro',
        'Martínez',
        'López',
      );

      profile.update(cmd);

      expect(profile.firstname).toBe('Pedro');
      expect(profile.firstLastname).toBe('Martínez');
      expect(profile.secondLastname).toBe('López');
    });

    it('debería respetar campos undefined en UpdateProfilePersonalCommand', () => {
      const profile = makeProfile();
      const cmd = new UpdateProfilePersonalCommand(
        PROFILE_ID,
        undefined,
        undefined,
        undefined,
      );

      profile.update(cmd);

      expect(profile.firstname).toBe('Juan');
      expect(profile.firstLastname).toBe('García');
    });

    it('debería actualizar dirección con UpdateProfileAddressCommand', () => {
      const profile = makeProfile();
      const cmd = new UpdateProfileAddressCommand(
        PROFILE_ID,
        'Av. Insurgentes',
        '200',
        undefined,
        'Roma Norte',
        undefined,
        'CDMX',
        'CDMX',
        '06700',
      );
      cmd.addressHash = 'nuevo-hash';

      profile.update(cmd);

      expect(profile.address.street).toBe('Av. Insurgentes');
      expect(profile.addressHash).toBe('nuevo-hash');
    });

    it('debería actualizar teléfono con UpdateProfileContactCommand', () => {
      const profile = makeProfile();
      const cmd = new UpdateProfileContactCommand(PROFILE_ID, '5598765432');
      cmd.phoneNumberHash = 'hash-nuevo';

      profile.update(cmd);

      expect(profile.phoneNumber.unpack()).toBe('5598765432');
      expect(profile.phoneNumberHash).toBe('hash-nuevo');
    });
  });
});
