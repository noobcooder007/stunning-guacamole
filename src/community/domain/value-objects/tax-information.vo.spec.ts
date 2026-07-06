import { TaxInformation, TaxInformationProps } from './tax-information.vo';

const validProps: TaxInformationProps = {
  rfc: 'XAXX010101000',
  rfcHash: 'hash-rfc',
  registeredName: 'Juan Pérez García',
  person: 'FÍSICA',
};

describe('TaxInformation', () => {
  describe('of()', () => {
    it('debería crear instancia con props válidas', () => {
      expect(() => TaxInformation.of(validProps)).not.toThrow();
    });
  });

  describe('getters', () => {
    let vo: TaxInformation;

    beforeEach(() => {
      vo = TaxInformation.of(validProps);
    });

    it('rfc debería retornar el valor correcto', () => {
      expect(vo.rfc).toBe('XAXX010101000');
    });

    it('rfcHash debería retornar el valor correcto', () => {
      expect(vo.rfcHash).toBe('hash-rfc');
    });

    it('registeredName debería retornar el valor correcto', () => {
      expect(vo.registeredName).toBe('Juan Pérez García');
    });

    it('person debería retornar el valor correcto', () => {
      expect(vo.person).toBe('FÍSICA');
    });
  });

  describe('equals()', () => {
    it('debería ser igual para las mismas props', () => {
      expect(
        TaxInformation.of(validProps).equals(TaxInformation.of(validProps)),
      ).toBe(true);
    });

    it('debería ser distinto cuando cambia el RFC', () => {
      const a = TaxInformation.of(validProps);
      const b = TaxInformation.of({ ...validProps, rfc: 'OTRO010101000' });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('updateWith()', () => {
    it('debería retornar la misma instancia si no hay cambios', () => {
      const vo = TaxInformation.of(validProps);
      expect(vo.updateWith(validProps)).toBe(vo);
    });

    it('debería retornar nueva instancia cuando cambia algún valor', () => {
      const vo = TaxInformation.of(validProps);
      const updated = vo.updateWith({ ...validProps, rfc: 'OTRO010101000' });
      expect(updated).not.toBe(vo);
      expect(updated.rfc).toBe('OTRO010101000');
    });
  });
});
