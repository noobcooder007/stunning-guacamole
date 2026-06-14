import { Address, Numeration } from './address.vo';
import { ZipCode } from './zip-code.vo';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

function makeAddress(overrides: Partial<{
  neighborhood: string;
  locality: string;
  noExt: string;
  noInt: string | null;
}> = {}) {
  return Address.of({
    street: 'Calle Principal',
    numeration: Numeration.of({
      noExt: overrides.noExt ?? '10',
      noInt: overrides.noInt !== undefined ? overrides.noInt : null,
    }),
    neighborhood: overrides.neighborhood ?? 'Centro',
    locality: overrides.locality,
    city: 'CDMX',
    state: 'CDMX',
    zipCode: ZipCode.of('06600'),
  });
}

describe('Numeration', () => {
  describe('of()', () => {
    it('debería crear instancia con noExt y noInt null', () => {
      expect(() => Numeration.of({ noExt: '10', noInt: null })).not.toThrow();
    });

    it('debería lanzar si noExt es null', () => {
      expect(() => Numeration.of({ noExt: null, noInt: null })).toThrow(InvalidAttributeException);
    });

    it('debería lanzar si noExt y noInt son iguales', () => {
      expect(() => Numeration.of({ noExt: 'A', noInt: 'A' })).toThrow(InvalidAttributeException);
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia cuando no hay cambios', () => {
      const num = Numeration.of({ noExt: '10', noInt: null });
      const updated = num.updateWith({});
      expect(updated).toBe(num);
    });
  });

  describe('equals()', () => {
    it('debería ser igual para la misma numeración', () => {
      const a = Numeration.of({ noExt: '10', noInt: 'B' });
      const b = Numeration.of({ noExt: '10', noInt: 'B' });
      expect(a.equals(b)).toBe(true);
    });

    it('debería ser distinto para numeraciones diferentes', () => {
      const a = Numeration.of({ noExt: '10', noInt: null });
      const b = Numeration.of({ noExt: '20', noInt: null });
      expect(a.equals(b)).toBe(false);
    });
  });
});

describe('Address', () => {
  it('debería crear instancia válida con neighborhood', () => {
    expect(() => makeAddress({ neighborhood: 'Centro' })).not.toThrow();
  });

  it('debería crear instancia válida con locality', () => {
    expect(() =>
      Address.of({
        street: 'Calle',
        numeration: Numeration.of({ noExt: '5', noInt: null }),
        locality: 'San Ángel',
        city: 'CDMX',
        state: 'CDMX',
        zipCode: ZipCode.of('01000'),
      }),
    ).not.toThrow();
  });

  it('debería lanzar si se proveen neighborhood y locality simultáneamente', () => {
    expect(() =>
      Address.of({
        street: 'Calle',
        numeration: Numeration.of({ noExt: '5', noInt: null }),
        neighborhood: 'Centro',
        locality: 'San Ángel',
        city: 'CDMX',
        state: 'CDMX',
        zipCode: ZipCode.of('01000'),
      }),
    ).toThrow(InvalidAttributeException);
  });

  it('debería lanzar si street es null', () => {
    expect(() =>
      Address.of({
        street: null,
        numeration: Numeration.of({ noExt: '5', noInt: null }),
        neighborhood: 'Centro',
        city: 'CDMX',
        state: 'CDMX',
        zipCode: ZipCode.of('01000'),
      }),
    ).toThrow(InvalidAttributeException);
  });

  describe('equals()', () => {
    it('debería ser igual para la misma dirección', () => {
      const a = makeAddress();
      const b = makeAddress();
      expect(a.equals(b)).toBe(true);
    });

    it('debería ser distinto cuando la calle cambia', () => {
      const a = makeAddress();
      const b = Address.of({
        street: 'Otra Calle',
        numeration: Numeration.of({ noExt: '10', noInt: null }),
        neighborhood: 'Centro',
        city: 'CDMX',
        state: 'CDMX',
        zipCode: ZipCode.of('06600'),
      });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia cuando no hay cambios', () => {
      const addr = makeAddress();
      expect(addr.updateWith({})).toBe(addr);
    });

    it('debería retornar nueva instancia cuando cambia la calle', () => {
      const addr = makeAddress();
      const updated = addr.updateWith({ street: 'Calle Nueva' });
      expect(updated.street).toBe('Calle Nueva');
      expect(updated).not.toBe(addr);
    });

    it('debería retornar nueva instancia cuando cambia el zipCode', () => {
      const addr = makeAddress();
      const updated = addr.updateWith({ zipCode: '01000' });
      expect(updated.zipCode.value).toBe('01000');
    });
  });
});
