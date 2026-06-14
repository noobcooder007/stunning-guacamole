import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePromiseDonationDto } from './create-promise-donation.dto';

const BID = '01907c2a-0000-7000-8000-000000000001';

const validPayload = {
  beneficientId: BID,
  promiseAmount: 200,
  currency: 'MXN',
  method: 'CASH',
  startDate: new Date('2099-01-01'),
  recurring: true,
  recurrence: 'MONTHLY',
};

describe('CreatePromiseDonationDto', () => {
  it('debería validar con datos correctos', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar beneficientId que no sea UUID', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, { ...validPayload, beneficientId: 'no-uuid' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'beneficientId')).toBeDefined();
  });

  it('debería rechazar promiseAmount menor a 0.01', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, { ...validPayload, promiseAmount: 0 });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'promiseAmount')).toBeDefined();
  });

  it('debería rechazar currency inválida', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, { ...validPayload, currency: 'EUR' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'currency')).toBeDefined();
  });

  it('debería rechazar recurrence inválida', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, { ...validPayload, recurrence: 'DAILY' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'recurrence')).toBeDefined();
  });

  it('debería aceptar todas las recurrencias válidas', async () => {
    const recurrences = ['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL'];
    for (const recurrence of recurrences) {
      const dto = plainToInstance(CreatePromiseDonationDto, { ...validPayload, recurrence });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'recurrence')).toBeUndefined();
    }
  });

  it('debería aceptar USD como currency válida', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, { ...validPayload, currency: 'USD' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar instructions como campo opcional', async () => {
    const dto = plainToInstance(CreatePromiseDonationDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.instructions).toBeUndefined();
  });
});
