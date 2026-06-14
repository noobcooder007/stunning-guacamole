import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterCollectorPaymentDto } from './register-collector-payment.dto';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

const validPayload = {
  amount: 100,
  paymentMethod: CollectorPaymentMethod.CASH,
  paidAt: '2026-06-13T12:00:00.000Z',
};

describe('RegisterCollectorPaymentDto', () => {
  it('debería validar con datos correctos', async () => {
    const dto = plainToInstance(RegisterCollectorPaymentDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar campos opcionales ausentes (reference, notes)', async () => {
    const dto = plainToInstance(RegisterCollectorPaymentDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.reference).toBeUndefined();
    expect(dto.notes).toBeUndefined();
  });

  it('debería validar con paymentMethod TRANSFER', async () => {
    const dto = plainToInstance(RegisterCollectorPaymentDto, {
      ...validPayload,
      paymentMethod: CollectorPaymentMethod.TRANSFER,
      reference: 'REF-XYZ',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar amount no numérico', async () => {
    const dto = plainToInstance(RegisterCollectorPaymentDto, {
      ...validPayload,
      amount: 'cien',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'amount')).toBeDefined();
  });

  it('debería rechazar amount negativo o cero', async () => {
    const dtoZero = plainToInstance(RegisterCollectorPaymentDto, { ...validPayload, amount: 0 });
    const dtoNeg = plainToInstance(RegisterCollectorPaymentDto, { ...validPayload, amount: -5 });
    const errorsZero = await validate(dtoZero);
    const errorsNeg = await validate(dtoNeg);
    expect(errorsZero.find((e) => e.property === 'amount')).toBeDefined();
    expect(errorsNeg.find((e) => e.property === 'amount')).toBeDefined();
  });

  it('debería rechazar paymentMethod inválido', async () => {
    const dto = plainToInstance(RegisterCollectorPaymentDto, {
      ...validPayload,
      paymentMethod: 'BITCOIN',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'paymentMethod')).toBeDefined();
  });

  it('debería rechazar paidAt con formato inválido', async () => {
    const dto = plainToInstance(RegisterCollectorPaymentDto, {
      ...validPayload,
      paidAt: 'no-es-fecha',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'paidAt')).toBeDefined();
  });
});
