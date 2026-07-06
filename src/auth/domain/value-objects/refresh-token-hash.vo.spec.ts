import { RefreshTokenHash } from './refresh-token-hash.vo';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

describe('RefreshTokenHash', () => {
  describe('of()', () => {
    it('debería crear instancia con valor válido', () => {
      expect(() => RefreshTokenHash.of('hashed-token-value')).not.toThrow();
    });

    it('debería lanzar si el valor es null', () => {
      expect(() => RefreshTokenHash.of(null)).toThrow(
        InvalidAttributeException,
      );
    });

    it('debería retornar el valor almacenado', () => {
      const vo = RefreshTokenHash.of('my-hash');
      expect(vo.unpack()).toBe('my-hash');
    });
  });

  describe('compare()', () => {
    it('debería retornar true cuando el token coincide', async () => {
      const hasher = {
        hash: jest.fn().mockResolvedValue('same-hash'),
        safeCompare: jest.fn().mockResolvedValue(true),
      };
      const vo = RefreshTokenHash.of('same-hash');

      const result = await vo.compare('plain-token', hasher as any);

      expect(result).toBe(true);
      expect(hasher.hash).toHaveBeenCalledWith('plain-token');
      expect(hasher.safeCompare).toHaveBeenCalledWith('same-hash', 'same-hash');
    });

    it('debería retornar false cuando el token no coincide', async () => {
      const hasher = {
        hash: jest.fn().mockResolvedValue('different-hash'),
        safeCompare: jest.fn().mockResolvedValue(false),
      };
      const vo = RefreshTokenHash.of('stored-hash');

      const result = await vo.compare('wrong-token', hasher as any);

      expect(result).toBe(false);
    });
  });
});
