import { Beneficient, BeneficientId } from './beneficient.aggregate';
import { ChurchId } from './church.aggregate';
import { Address, Numeration } from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';

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

      expect(b.deactivatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
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
  });
});
