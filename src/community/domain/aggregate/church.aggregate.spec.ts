import { Church, ChurchId } from './church.aggregate';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';
import { Address, Numeration } from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { Priest } from '@/community/domain/value-objects/priest.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';

const CHURCH_ID = '01907c2a-0000-7000-8000-000000000001';

const validProps = {
  ecclesialIdentity: EcclesialIdentity.of({
    name: 'Parroquia San Pedro',
    vicaria: 'Norte',
    decanato: 'D1',
    parroquia: 'San Pedro',
    capilla: 'Central',
  }),
  address: Address.of({
    street: 'Calle 1',
    numeration: Numeration.of({ noExt: '10', noInt: null }),
    neighborhood: 'Centro',
    city: 'CDMX',
    state: 'CDMX',
    zipCode: ZipCode.of('06600'),
  }),
  phoneNumber: PhoneNumber.of('5512345678'),
  priest: Priest.of({ firstname: 'Pedro', firstLastname: 'García', secondLastname: null }),
  auxiliarPriest: Priest.of({ firstname: 'Juan', firstLastname: 'López', secondLastname: null }),
  isActive: true,
  createdAt: new Date('2026-01-01'),
};

function makeChurch(): Church {
  return Church.recreate(CHURCH_ID, validProps);
}

describe('Church', () => {
  describe('create()', () => {
    it('debería crear la iglesia con isActive=true', () => {
      const church = Church.create(validProps);
      expect(church.isActive).toBe(true);
      expect(church._id).toBeDefined();
    });
  });

  describe('recreate()', () => {
    it('debería reconstruir la iglesia con el ID dado', () => {
      const church = makeChurch();
      expect(church._id.unpack()).toBe(CHURCH_ID);
    });
  });

  describe('getters', () => {
    let church: Church;
    beforeEach(() => { church = makeChurch(); });

    it('debería retornar ecclesialIdentity', () => {
      expect(church.ecclesialIdentity.name).toBe('Parroquia San Pedro');
    });

    it('debería retornar priest', () => {
      expect(church.priest.firstname).toBe('Pedro');
    });

    it('debería retornar auxiliarPriest', () => {
      expect(church.auxiliarPriest.firstname).toBe('Juan');
    });

    it('debería retornar address', () => {
      expect(church.address.street).toBe('Calle 1');
    });

    it('debería retornar phoneNumber', () => {
      expect(church.phoneNumber.unpack()).toBe('5512345678');
    });

    it('debería retornar createdAt', () => {
      expect(church.createdAt).toBeDefined();
    });

    it('debería retornar isActive', () => {
      expect(church.isActive).toBe(true);
    });
  });

  describe('update()', () => {
    let church: Church;
    beforeEach(() => { church = makeChurch(); });

    it('debería actualizar la dirección con UpdateChurchAddressCommand', () => {
      const { UpdateChurchAddressCommand } = require('@/community/application/command/update-church.command');
      const cmd = new UpdateChurchAddressCommand(
        CHURCH_ID,
        'Av. Reforma',
        '500',
        null,
        'Juárez',
        null,
        'CDMX',
        'CDMX',
        '06600',
      );

      church.update(cmd);

      expect(church.address.street).toBe('Av. Reforma');
    });

    it('debería actualizar el sacerdote con UpdateChurchPriestCommand', () => {
      const { UpdateChurchPriestCommand } = require('@/community/application/command/update-church.command');
      const cmd = new UpdateChurchPriestCommand(CHURCH_ID, 'Carlos', 'Ramírez', 'Torres');

      church.update(cmd);

      expect(church.priest.firstname).toBe('Carlos');
      expect(church.priest.firstLastname).toBe('Ramírez');
    });

    it('debería actualizar el sacerdote auxiliar con UpdateChurchAuxiliarPriestCommand', () => {
      const { UpdateChurchAuxiliarPriestCommand } = require('@/community/application/command/update-church.command');
      const cmd = new UpdateChurchAuxiliarPriestCommand(CHURCH_ID, 'Miguel', 'Soto', null);

      church.update(cmd);

      expect(church.auxiliarPriest.firstname).toBe('Miguel');
    });

    it('debería actualizar la identidad eclesial con UpdateChurchEcclesialIdentityCommand', () => {
      const { UpdateChurchEcclesialIdentityCommand } = require('@/community/application/command/update-church.command');
      const cmd = new UpdateChurchEcclesialIdentityCommand(
        CHURCH_ID,
        'Parroquia Santa María',
        'Sur',
        'D2',
        'Santa María',
        'Capilla Norte',
      );

      church.update(cmd);

      expect(church.ecclesialIdentity.name).toBe('Parroquia Santa María');
      expect(church.ecclesialIdentity.vicaria).toBe('Sur');
    });

    it('debería actualizar el teléfono con UpdateChurchPhoneNumberCommand', () => {
      const { UpdateChurchPhoneNumberCommand } = require('@/community/application/command/update-church.command');
      const cmd = new UpdateChurchPhoneNumberCommand(CHURCH_ID, '5598765432');

      church.update(cmd);

      expect(church.phoneNumber.unpack()).toBe('5598765432');
    });
  });
});
