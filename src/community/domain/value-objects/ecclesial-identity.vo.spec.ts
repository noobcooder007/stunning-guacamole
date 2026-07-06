import {
  EcclesialIdentity,
  EcclesialIdentityProps,
} from './ecclesial-identity.vo';

const validProps: EcclesialIdentityProps = {
  name: 'Parroquia San Pedro',
  vicaria: 'Vicaria Norte',
  decanato: 'Decanato 1',
  parroquia: 'San Pedro Apóstol',
  capilla: 'Capilla Central',
};

describe('EcclesialIdentity', () => {
  describe('of()', () => {
    it('debería crear instancia con props válidas', () => {
      expect(() => EcclesialIdentity.of(validProps)).not.toThrow();
    });
  });

  describe('getters', () => {
    let vo: EcclesialIdentity;
    beforeEach(() => {
      vo = EcclesialIdentity.of(validProps);
    });

    it('name debería retornar el valor correcto', () => {
      expect(vo.name).toBe('Parroquia San Pedro');
    });
    it('vicaria debería retornar el valor correcto', () => {
      expect(vo.vicaria).toBe('Vicaria Norte');
    });
    it('decanato debería retornar el valor correcto', () => {
      expect(vo.decanato).toBe('Decanato 1');
    });
    it('parroquia debería retornar el valor correcto', () => {
      expect(vo.parroquia).toBe('San Pedro Apóstol');
    });
    it('capilla debería retornar el valor correcto', () => {
      expect(vo.capilla).toBe('Capilla Central');
    });
  });

  describe('equals()', () => {
    it('debería ser igual para las mismas props', () => {
      const a = EcclesialIdentity.of(validProps);
      const b = EcclesialIdentity.of(validProps);
      expect(a.equals(b)).toBe(true);
    });

    it('debería ser distinto cuando cambia el nombre', () => {
      const a = EcclesialIdentity.of(validProps);
      const b = EcclesialIdentity.of({ ...validProps, name: 'Otra Parroquia' });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia cuando no hay cambios', () => {
      const vo = EcclesialIdentity.of(validProps);
      expect(vo.updateWith(validProps)).toBe(vo);
    });

    it('debería retornar nueva instancia cuando cambia algún campo', () => {
      const vo = EcclesialIdentity.of(validProps);
      const updated = vo.updateWith({ ...validProps, name: 'Nueva Parroquia' });
      expect(updated.name).toBe('Nueva Parroquia');
      expect(updated).not.toBe(vo);
    });
  });
});
