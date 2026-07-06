import { ExpiresAtDate } from './expires-at-date.vo';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

describe('ExpiresAtDate', () => {
  describe('of()', () => {
    it('debería crear instancia con fecha futura', () => {
      expect(() => ExpiresAtDate.of(new Date('2099-01-01'))).not.toThrow();
    });

    it('debería lanzar con fecha pasada', () => {
      expect(() => ExpiresAtDate.of(new Date('2000-01-01'))).toThrow(
        InvalidAttributeException,
      );
    });
  });

  describe('isAlive()', () => {
    it('debería retornar true cuando la fecha de expiración es futura (mayor a 10 s)', () => {
      const future = new Date(Date.now() + 60_000);
      const vo = ExpiresAtDate.of(future);
      expect(vo.isAlive(new Date())).toBe(true);
    });

    it('debería retornar false cuando el momento actual supera la expiración menos skew', () => {
      const future = new Date(Date.now() + 60_000);
      const vo = ExpiresAtDate.of(future);
      const afterExpiry = new Date(Date.now() + 120_000);
      expect(vo.isAlive(afterExpiry)).toBe(false);
    });
  });
});
