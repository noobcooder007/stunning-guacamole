import 'reflect-metadata';
import { instanceToPlain } from 'class-transformer';
import { PaymentDataResponseDto } from './payment-data.response';

function makeDto(): PaymentDataResponseDto {
  return Object.assign(new PaymentDataResponseDto(), {
    commissionPercent: 10,
    nomina: 500,
    transportAllowance: 200,
    bank: 'BBVA',
    reference: '1234567890',
  });
}

describe('PaymentDataResponseDto', () => {
  it('no debería exponer campos financieros para un rol sin grupo autorizado (ej. collector)', () => {
    const plain = instanceToPlain(makeDto(), { groups: ['collector'] });

    expect(plain.commissionPercent).toBeUndefined();
    expect(plain.nomina).toBeUndefined();
    expect(plain.transportAllowance).toBeUndefined();
    expect(plain.bank).toBeUndefined();
    expect(plain.reference).toBeUndefined();
  });

  it('debería exponer campos financieros para el grupo owner', () => {
    const plain = instanceToPlain(makeDto(), { groups: ['owner'] });

    expect(plain.commissionPercent).toBe(10);
    expect(plain.nomina).toBe(500);
    expect(plain.transportAllowance).toBe(200);
    expect(plain.bank).toBe('BBVA');
    expect(plain.reference).toBe('1234567890');
  });

  it('debería exponer campos financieros para administrator y superadministrator', () => {
    expect(
      instanceToPlain(makeDto(), { groups: ['administrator'] }).bank,
    ).toBe('BBVA');
    expect(
      instanceToPlain(makeDto(), { groups: ['superadministrator'] }).bank,
    ).toBe('BBVA');
  });

  it('no debería exponer nada sin ningún grupo', () => {
    const plain = instanceToPlain(makeDto());

    expect(plain.commissionPercent).toBeUndefined();
    expect(plain.bank).toBeUndefined();
  });
});
