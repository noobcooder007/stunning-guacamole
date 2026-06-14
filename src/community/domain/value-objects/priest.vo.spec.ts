import { Priest } from './priest.vo';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

const validProps = { firstname: 'Juan', firstLastname: 'Pérez', secondLastname: 'García' };

describe('Priest', () => {
  describe('of()', () => {
    it('debería crear instancia con props válidas', () => {
      expect(() => Priest.of(validProps)).not.toThrow();
    });

    it('debería lanzar si firstname es null', () => {
      expect(() => Priest.of({ ...validProps, firstname: null })).toThrow(InvalidAttributeException);
    });

    it('debería lanzar si firstLastname es null', () => {
      expect(() => Priest.of({ ...validProps, firstLastname: null })).toThrow(InvalidAttributeException);
    });
  });

  describe('getters', () => {
    it('debería retornar firstname', () => {
      expect(Priest.of(validProps).firstname).toBe('Juan');
    });

    it('debería retornar firstLastname', () => {
      expect(Priest.of(validProps).firstLastname).toBe('Pérez');
    });

    it('debería retornar secondLastname', () => {
      expect(Priest.of(validProps).secondLastname).toBe('García');
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia cuando no hay cambios', () => {
      const p = Priest.of(validProps);
      expect(p.updateWith(validProps)).toBe(p);
    });

    it('debería retornar nueva instancia cuando cambia el firstname', () => {
      const p = Priest.of(validProps);
      const updated = p.updateWith({ ...validProps, firstname: 'Pedro' });
      expect(updated.firstname).toBe('Pedro');
      expect(updated).not.toBe(p);
    });
  });
});
