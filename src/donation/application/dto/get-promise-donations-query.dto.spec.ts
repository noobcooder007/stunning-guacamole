import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetPromiseDonationsQueryDto } from './get-promise-donations-query.dto';

describe('GetPromiseDonationsQueryDto', () => {
  it('debería validar con todos los campos opcionales vacíos', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería validar con currency y method como strings', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, {
      currency: 'MXN',
      method: 'CASH',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería transformar "true" a boolean true para recurring', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, { recurring: 'true' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.recurring).toBe(true);
  });

  it('debería transformar "false" a boolean false para recurring', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, { recurring: 'false' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.recurring).toBe(false);
  });

  it('debería transformar "true" a boolean true para isActive', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, { isActive: 'true' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(true);
  });

  it('debería transformar "false" a boolean false para isActive', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, { isActive: 'false' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(false);
  });

  it('debería rechazar currency que no sea string', async () => {
    const dto = plainToInstance(GetPromiseDonationsQueryDto, { currency: 123 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'currency')).toBe(true);
  });
});
