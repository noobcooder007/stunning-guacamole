import { PhoneNumber } from './phone-number.vo';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

describe('PhoneNumber', () => {
  describe('of()', () => {
    it('debería crear instancia con 10 dígitos', () => {
      expect(() => PhoneNumber.of('5512345678')).not.toThrow();
    });

    it('debería lanzar DomainException con menos de 10 dígitos', () => {
      expect(() => PhoneNumber.of('551234')).toThrow(DomainException);
    });

    it('debería lanzar DomainException con más de 10 dígitos', () => {
      expect(() => PhoneNumber.of('55123456789')).toThrow(DomainException);
    });

    it('debería conservar el valor original (con separadores)', () => {
      const phone = PhoneNumber.of('55-1234-5678');
      expect(phone.unpack()).toBe('55-1234-5678');
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia cuando el valor es igual', () => {
      const phone = PhoneNumber.of('5512345678');
      const result = phone.updateWith('5512345678');
      expect(result).toBe(phone);
    });

    it('debería retornar una nueva instancia cuando el valor cambia', () => {
      const phone = PhoneNumber.of('5512345678');
      const result = phone.updateWith('5598765432');
      expect(result).not.toBe(phone);
      expect(result.unpack()).toBe('5598765432');
    });

    it('debería retornar la misma instancia cuando el valor es undefined', () => {
      const phone = PhoneNumber.of('5512345678');
      const result = phone.updateWith(undefined);
      expect(result).toBe(phone);
    });
  });
});
