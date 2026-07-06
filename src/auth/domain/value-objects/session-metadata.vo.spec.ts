import { SessionMetadata } from './session-metadata.vo';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

describe('SessionMetadata', () => {
  describe('of()', () => {
    it('debería crear instancia con IPv4 válida', () => {
      expect(() =>
        SessionMetadata.of({ ip: '192.168.1.1', userAgent: 'Mozilla/5.0' }),
      ).not.toThrow();
    });

    it('debería crear instancia con dirección IPv6', () => {
      expect(() =>
        SessionMetadata.of({ ip: '::1', userAgent: 'Mozilla/5.0' }),
      ).not.toThrow();
    });

    it('debería lanzar con IP inválida', () => {
      expect(() =>
        SessionMetadata.of({ ip: 'no-es-ip', userAgent: 'Mozilla/5.0' }),
      ).toThrow(InvalidAttributeException);
    });

    it('debería lanzar con userAgent null', () => {
      expect(() =>
        SessionMetadata.of({ ip: '192.168.1.1', userAgent: null }),
      ).toThrow();
    });
  });

  describe('validateFingerprint()', () => {
    it('debería retornar true cuando el userAgent coincide', () => {
      const meta = SessionMetadata.of({
        ip: '10.0.0.1',
        userAgent: 'Chrome/120',
      });
      expect(meta.validateFingerprint('Chrome/120')).toBe(true);
    });

    it('debería retornar false cuando el userAgent difiere', () => {
      const meta = SessionMetadata.of({
        ip: '10.0.0.1',
        userAgent: 'Chrome/120',
      });
      expect(meta.validateFingerprint('Firefox/110')).toBe(false);
    });
  });
});
