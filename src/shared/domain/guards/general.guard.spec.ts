import { GeneralGuard } from './general.guard';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

describe('GeneralGuard', () => {
  describe('againstNullOrUndefined()', () => {
    it('no debería lanzar cuando el valor es definido', () => {
      expect(() =>
        GeneralGuard.againstNullOrUndefined('valor', 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar con null', () => {
      expect(() =>
        GeneralGuard.againstNullOrUndefined(null, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar con undefined', () => {
      expect(() =>
        GeneralGuard.againstNullOrUndefined(undefined, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstGreatherThanZero()', () => {
    it('no debería lanzar cuando el valor es positivo', () => {
      expect(() =>
        GeneralGuard.againstGreatherThanZero(1, 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando el valor es cero', () => {
      expect(() =>
        GeneralGuard.againstGreatherThanZero(0, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar cuando el valor es negativo', () => {
      expect(() =>
        GeneralGuard.againstGreatherThanZero(-5, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstBothAreEquals()', () => {
    it('no debería lanzar cuando los valores son distintos', () => {
      expect(() =>
        GeneralGuard.againstBothAreEquals('A', 'B', 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando ambos valores son iguales', () => {
      expect(() =>
        GeneralGuard.againstBothAreEquals('X', 'X', 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstLengthIsEqualsTo()', () => {
    it('no debería lanzar cuando la longitud coincide', () => {
      expect(() =>
        GeneralGuard.againstLengthIsEqualsTo('12345', 5, 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando la longitud no coincide', () => {
      expect(() =>
        GeneralGuard.againstLengthIsEqualsTo('123', 5, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('mutuallyExclusive()', () => {
    it('no debería lanzar si solo uno está definido', () => {
      expect(() =>
        GeneralGuard.mutuallyExclusive('valor', null, 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar si ambos están definidos', () => {
      expect(() =>
        GeneralGuard.mutuallyExclusive('A', 'B', 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstValueIsUUID()', () => {
    it('no debería lanzar con UUID válido', () => {
      expect(() =>
        GeneralGuard.againstValueIsUUID(
          '01907c2a-0000-7000-8000-000000000001',
          'Entity',
        ),
      ).not.toThrow();
    });

    it('debería lanzar con string que no es UUID', () => {
      expect(() =>
        GeneralGuard.againstValueIsUUID('no-es-uuid', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstStartDateBeforeNow()', () => {
    it('no debería lanzar con fecha futura', () => {
      const future = new Date('2099-01-01');
      expect(() =>
        GeneralGuard.againstStartDateBeforeNow(future, 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar con fecha pasada', () => {
      const past = new Date('2000-01-01');
      expect(() =>
        GeneralGuard.againstStartDateBeforeNow(past, 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstValueIsNotEqualTo()', () => {
    it('no debería lanzar cuando los valores son iguales', () => {
      expect(() =>
        GeneralGuard.againstValueIsNotEqualTo('A', 'A', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando los valores difieren', () => {
      expect(() =>
        GeneralGuard.againstValueIsNotEqualTo('A', 'B', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstValueIsEqualTo()', () => {
    it('no debería lanzar cuando los valores son distintos', () => {
      expect(() =>
        GeneralGuard.againstValueIsEqualTo('A', 'B', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando los valores son iguales', () => {
      expect(() =>
        GeneralGuard.againstValueIsEqualTo('A', 'A', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstArrayLengthIsGreaterThan()', () => {
    it('no debería lanzar cuando el tamaño supera el límite', () => {
      expect(() =>
        GeneralGuard.againstArrayLengthIsGreaterThan(5, 3, 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando el tamaño no supera el límite', () => {
      expect(() =>
        GeneralGuard.againstArrayLengthIsGreaterThan(2, 3, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar cuando el tamaño es igual al límite', () => {
      expect(() =>
        GeneralGuard.againstArrayLengthIsGreaterThan(3, 3, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstArrayLengthIsLessThan()', () => {
    it('no debería lanzar cuando el tamaño supera el límite', () => {
      expect(() =>
        GeneralGuard.againstArrayLengthIsLessThan(5, 3, 'msg', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar cuando el tamaño no supera el límite', () => {
      expect(() =>
        GeneralGuard.againstArrayLengthIsLessThan(2, 3, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar cuando el tamaño es igual al límite', () => {
      expect(() =>
        GeneralGuard.againstArrayLengthIsLessThan(3, 3, 'msg', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('againstIPNotValid()', () => {
    it('no debería lanzar con una IP válida', () => {
      expect(() =>
        GeneralGuard.againstIPNotValid('192.168.1.1', 'Entity'),
      ).not.toThrow();
    });

    it('debería lanzar con una IP inválida', () => {
      expect(() =>
        GeneralGuard.againstIPNotValid('999.999.999.999', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar con un string que no es IP', () => {
      expect(() =>
        GeneralGuard.againstIPNotValid('no-es-una-ip', 'Entity'),
      ).toThrow(InvalidAttributeException);
    });
  });
});
