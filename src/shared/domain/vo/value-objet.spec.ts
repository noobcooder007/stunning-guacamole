import { ValueObject } from './value-objet';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';

describe('ValueObject.toJSON()', () => {
  it('debería serializar un VO con props complejas (PaymentData)', () => {
    const vo = PaymentData.of({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'REF-001',
      nomina: 500,
      transportAllowance: 100,
    });

    const json = vo.toJSON();

    expect(json).toEqual({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'REF-001',
      nomina: 500,
      transportAllowance: 100,
    });
  });

  it('debería serializar un VO primitivo (ZipCode)', () => {
    const vo = ZipCode.of('06600');
    const json = vo.toJSON();
    expect(json).toBe('06600');
  });

  it('debería retornar false cuando se compara con undefined (usando equals base)', () => {
    // PaymentData usa el equals() del ValueObject base que maneja null/undefined
    const vo = PaymentData.of({ commissionPercent: 10, bank: 'BBVA', reference: 'R', nomina: 0, transportAllowance: 0 });
    expect(vo.equals(undefined)).toBe(false);
  });

  it('debería retornar false cuando se compara con un VO con props undefined', () => {
    const vo = PaymentData.of({ commissionPercent: 10, bank: 'BBVA', reference: 'R', nomina: 0, transportAllowance: 0 });
    const voSinProps = Object.create(ValueObject.prototype);
    expect(vo.equals(voSinProps)).toBe(false);
  });
});
