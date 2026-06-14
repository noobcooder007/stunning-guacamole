import { ZipCode } from './zip-code.vo';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

describe('ZipCode', () => {
  describe('of()', () => {
    it('debería crear instancia con 5 dígitos válidos', () => {
      expect(() => ZipCode.of('06600')).not.toThrow();
    });

    it('debería lanzar InvalidAttributeException con menos de 5 dígitos', () => {
      expect(() => ZipCode.of('0660')).toThrow(InvalidAttributeException);
    });

    it('debería lanzar InvalidAttributeException con más de 5 dígitos', () => {
      expect(() => ZipCode.of('066000')).toThrow(InvalidAttributeException);
    });

    it('debería lanzar InvalidAttributeException con letras', () => {
      expect(() => ZipCode.of('0660A')).toThrow(InvalidAttributeException);
    });
  });

  describe('value', () => {
    it('debería retornar el código postal', () => {
      expect(ZipCode.of('06600').value).toBe('06600');
    });
  });

  describe('equals()', () => {
    it('debería ser igual para el mismo código', () => {
      expect(ZipCode.of('06600').equals(ZipCode.of('06600'))).toBe(true);
    });

    it('debería ser distinto para códigos diferentes', () => {
      expect(ZipCode.of('06600').equals(ZipCode.of('01000'))).toBe(false);
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia si el código no cambia', () => {
      const zip = ZipCode.of('06600');
      expect(zip.updateWith('06600')).toBe(zip);
    });

    it('debería retornar una nueva instancia si el código cambia', () => {
      const zip = ZipCode.of('06600');
      const updated = zip.updateWith('01000');
      expect(updated.value).toBe('01000');
      expect(updated).not.toBe(zip);
    });
  });
});
