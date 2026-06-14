import { PaymentData, PaymentDataProps } from './payment-data.vo';

const validProps: PaymentDataProps = {
  commissionPercent: 10,
  bank: 'BBVA',
  reference: 'REF-001',
  nomina: 500,
  transportAllowance: 100,
};

describe('PaymentData', () => {
  describe('of()', () => {
    it('debería crear una instancia con props válidas', () => {
      const vo = PaymentData.of(validProps);
      expect(vo).toBeDefined();
      expect(vo).toBeInstanceOf(PaymentData);
    });
  });

  describe('getters', () => {
    let vo: PaymentData;

    beforeEach(() => {
      vo = PaymentData.of(validProps);
    });

    it('commissionPercent debería retornar el valor correcto', () => {
      expect(vo.commissionPercent).toBe(10);
    });

    it('bank debería retornar el valor correcto', () => {
      expect(vo.bank).toBe('BBVA');
    });

    it('reference debería retornar el valor correcto', () => {
      expect(vo.reference).toBe('REF-001');
    });

    it('nomina debería retornar el valor correcto', () => {
      expect(vo.nomina).toBe(500);
    });

    it('transportAllowance debería retornar el valor correcto', () => {
      expect(vo.transportAllowance).toBe(100);
    });
  });

  describe('equals()', () => {
    it('debería ser igual para las mismas props', () => {
      const a = PaymentData.of(validProps);
      const b = PaymentData.of(validProps);
      expect(a.equals(b)).toBe(true);
    });

    it('debería ser distinto cuando cambia commissionPercent', () => {
      const a = PaymentData.of(validProps);
      const b = PaymentData.of({ ...validProps, commissionPercent: 20 });
      expect(a.equals(b)).toBe(false);
    });

    it('debería ser distinto cuando cambia bank', () => {
      const a = PaymentData.of(validProps);
      const b = PaymentData.of({ ...validProps, bank: 'Banamex' });
      expect(a.equals(b)).toBe(false);
    });

    it('debería ser distinto cuando cambia nomina', () => {
      const a = PaymentData.of(validProps);
      const b = PaymentData.of({ ...validProps, nomina: 999 });
      expect(a.equals(b)).toBe(false);
    });

    it('debería retornar false al comparar con undefined', () => {
      const a = PaymentData.of(validProps);
      expect(a.equals(undefined)).toBe(false);
    });
  });

  describe('unpack()', () => {
    it('debería retornar todas las props originales', () => {
      const vo = PaymentData.of(validProps);
      expect(vo.unpack()).toEqual(validProps);
    });

    it('las props deben ser inmutables (frozen)', () => {
      const vo = PaymentData.of(validProps);
      expect(Object.isFrozen(vo.unpack())).toBe(true);
    });
  });
});
