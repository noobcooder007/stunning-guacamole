import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSpecialReceiptDto } from './create-special-receipt.dto';

const B_ID = '01907c2a-0000-7000-8000-000000000001';
const C_ID = '01907c2a-0000-7000-8000-000000000002';

const validPayload = {
  amount: 100.5,
  currency: 'MXN',
  beneficientId: B_ID,
  collectorId: C_ID,
};

describe('CreateSpecialReceiptDto', () => {
  it('debería validar con datos correctos', async () => {
    const dto = plainToInstance(CreateSpecialReceiptDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar currency USD', async () => {
    const dto = plainToInstance(CreateSpecialReceiptDto, {
      ...validPayload,
      currency: 'USD',
    });
    expect((await validate(dto)).length).toBe(0);
  });

  it('debería rechazar amount menor o igual a cero', async () => {
    const dto = plainToInstance(CreateSpecialReceiptDto, {
      ...validPayload,
      amount: 0,
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'amount')).toBeDefined();
  });

  it('debería rechazar currency inválido', async () => {
    const dto = plainToInstance(CreateSpecialReceiptDto, {
      ...validPayload,
      currency: 'EUR',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'currency')).toBeDefined();
  });

  it('debería rechazar beneficientId que no sea UUID', async () => {
    const dto = plainToInstance(CreateSpecialReceiptDto, {
      ...validPayload,
      beneficientId: 'no-uuid',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'beneficientId')).toBeDefined();
  });

  it('debería rechazar collectorId que no sea UUID', async () => {
    const dto = plainToInstance(CreateSpecialReceiptDto, {
      ...validPayload,
      collectorId: 'no-uuid',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'collectorId')).toBeDefined();
  });
});
