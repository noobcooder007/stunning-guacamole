import { Beneficient, BeneficientId } from './beneficient.aggregate';
import { ChurchId } from './church.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import {
  UpdateBeneficientPersonalCommand,
  UpdateBeneficientAddressCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientTaxCommand,
  UpdateBeneficientPrivacyCommand,
} from '@/community/application/command/update-beneficient.command';

const BID = '01907c2a-0000-7000-8000-000000000001';
const CID = '01907c2a-0000-7000-8000-000000000002';

function makeBeneficient(isActive = true): Beneficient {
  return Beneficient.recreate(BID, {
    title: 'Sr.',
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: 'García',
    birthday: new Date('1985-03-15'),
    genre: 'MALE',
    maritalStatus: 'SINGLE',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'addr-hash',
    church: ChurchId.of(CID),
    keepPrivate: false,
    isActive,
    reasonDeactivated: isActive ? null : 'Baja',
    beneficientNumber: 99,
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

    it('debería retornar firstname y firstLastname', () => {
      const b = makeBeneficient();
      expect(b.firstname).toBe('Juan');
      expect(b.firstLastname).toBe('Pérez');
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
  });

  describe('update()', () => {
    it('debería actualizar datos personales con UpdateBeneficientPersonalCommand', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientPersonalCommand(
        BID,
        'Sra.',
        'María',
        'López',
        'Soto',
        new Date('1990-05-20'),
        'FEMALE',
        'MARRIED',
        null,
      );

      b.update(cmd);

      expect(b.title).toBe('Sra.');
      expect(b.firstname).toBe('María');
      expect(b.firstLastname).toBe('López');
      expect(b.genre).toBe('FEMALE');
    });

    it('debería actualizar dirección con UpdateBeneficientAddressCommand', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientAddressCommand(
        BID,
        'Av. Juárez',
        '100',
        null,
        'Guerrero',
        null,
        'CDMX',
        'CDMX',
        '06300',
      );
      cmd.addressHash = 'nuevo-hash';

      b.update(cmd);

      expect(b.address.street).toBe('Av. Juárez');
      expect(b.addressHash).toBe('nuevo-hash');
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

    it('debería actualizar teléfono con UpdateBeneficientContactCommand', () => {
      const b = makeBeneficient();
      const cmd = new UpdateBeneficientContactCommand(
        BID,
        undefined,
        '5512345678',
      );
      cmd.phoneNumberHash = 'phone-hash';

      b.update(cmd);

      expect(b.phoneNumber).toBe('5512345678');
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
