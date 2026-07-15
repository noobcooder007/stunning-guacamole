import { Beneficient } from './beneficient.aggregate';
import { ChurchId } from './church.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import {
  UpdateBeneficientPersonalCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientTaxCommand,
  UpdateBeneficientPrivacyCommand,
} from '@/community/application/command/update-beneficient.command';

const BID = '01907c2a-0000-7000-8000-000000000001';
const CID = '01907c2a-0000-7000-8000-000000000002';
const PROFILE_ID = '01907c2a-0000-7000-8000-000000000003';
const USER_ID = '01907c2a-0000-7000-8000-000000000004';

function makeProfile() {
  return Profile.recreate(PROFILE_ID, {
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: 'García',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'addr-hash',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'phone-hash',
  });
}

function makeBeneficient(isActive = true, userId?: UserId): Beneficient {
  return Beneficient.recreate(BID, {
    title: 'Sr.',
    profileId: makeProfile()._id,
    profile: makeProfile(),
    birthday: new Date('1985-03-15'),
    genre: 'MALE',
    maritalStatus: 'SINGLE',
    church: ChurchId.of(CID),
    keepPrivate: false,
    isActive,
    reasonDeactivated: isActive ? null : 'Baja',
    beneficientNumber: 99,
    userId,
  });
}

describe('Beneficient', () => {
  describe('deactivate()', () => {
    it('debería marcar al beneficiario como inactivo', () => {
      const b = makeBeneficient(true);

      b.deactivate('Solicitud propia');

      expect(b.isActive).toBe(false);
      expect(b.reasonDeactivated).toBe('Solicitud propia');
      expect(b.deactivatedAt).toBeDefined();
    });

    it('debería registrar la fecha de desactivación', () => {
      const b = makeBeneficient(true);
      const before = new Date();

      b.deactivate('Motivo');

      expect(b.deactivatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe('getters', () => {
    it('debería retornar el id correcto', () => {
      expect(makeBeneficient()._id.unpack()).toBe(BID);
    });

    it('debería retornar beneficientNumber', () => {
      expect(makeBeneficient().beneficientNumber).toBe(99);
    });

    it('debería retornar isActive', () => {
      expect(makeBeneficient(true).isActive).toBe(true);
      expect(makeBeneficient(false).isActive).toBe(false);
    });

    it('debería retornar title, birthday, genre y maritalStatus', () => {
      const b = makeBeneficient();
      expect(b.title).toBe('Sr.');
      expect(b.birthday).toEqual(new Date('1985-03-15'));
      expect(b.genre).toBe('MALE');
      expect(b.maritalStatus).toBe('SINGLE');
    });

    it('debería retornar church', () => {
      expect(makeBeneficient().church.unpack()).toBe(CID);
    });

    it('debería retornar keepPrivate', () => {
      expect(makeBeneficient().keepPrivate).toBe(false);
    });

    it('debería retornar deactivatedAt null cuando activo', () => {
      expect(makeBeneficient(true).deactivatedAt).toBeNull();
    });

    it('debería retornar el profile asociado', () => {
      const b = makeBeneficient();
      expect(b.profile.firstname).toBe('Juan');
      expect(b.profileId.equals(b.profile._id)).toBe(true);
    });

    it('debería retornar userId undefined cuando no tiene cuenta de acceso', () => {
      expect(makeBeneficient().userId).toBeUndefined();
    });

    it('debería retornar userId cuando tiene cuenta de acceso vinculada', () => {
      const b = makeBeneficient(true, UserId.of(USER_ID));
      expect(b.userId.unpack()).toBe(USER_ID);
    });
  });

  describe('update()', () => {
    it('debería actualizar datos de rol con UpdateBeneficientPersonalCommand', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientPersonalCommand(
        BID,
        'Sra.',
        undefined,
        undefined,
        undefined,
        new Date('1990-05-20'),
        'FEMALE',
        'MARRIED',
        null,
      );

      b.update(cmd);

      expect(b.title).toBe('Sra.');
      expect(b.genre).toBe('FEMALE');
      expect(b.maritalStatus).toBe('MARRIED');
    });

    it('debería actualizar email con UpdateBeneficientContactCommand', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientContactCommand(
        BID,
        'juan@example.com',
        null,
      );
      cmd.emailHash = 'email-hash';

      b.update(cmd);

      expect(b.email).toBe('juan@example.com');
      expect(b.emailHash).toBe('email-hash');
    });

    it('no debería tocar email cuando no viene en el comando', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientContactCommand(
        BID,
        undefined,
        '5512345678',
      );

      b.update(cmd);

      expect(b.email).toBeUndefined();
    });

    it('debería actualizar iglesia con UpdateBeneficientChurchCommand', () => {
      const newChurchId = '01907c2a-0000-7000-8000-000000000099';
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientChurchCommand(BID, newChurchId);

      b.update(cmd);

      expect(b.church.unpack()).toBe(newChurchId);
    });

    it('debería poner taxInformation a null cuando person es null', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientTaxCommand(BID, null);

      b.update(cmd);

      expect(b.taxInformation).toBeNull();
    });

    it('debería crear taxInformation cuando no existía', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientTaxCommand(
        BID,
        'FÍSICA',
        'Juan Pérez',
        'PEGJ850315XX0',
      );
      cmd.rfcHash = 'rfc-hash';

      b.update(cmd);

      expect(b.taxInformation).not.toBeNull();
      expect(b.taxInformation.person).toBe('FÍSICA');
    });

    it('debería actualizar keepPrivate con UpdateBeneficientPrivacyCommand', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientPrivacyCommand(BID, true);

      b.update(cmd);

      expect(b.keepPrivate).toBe(true);
    });
  });
});
