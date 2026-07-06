import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetUnassignedBeneficientsQueryDto } from './get-unassigned-beneficients-query.dto';

describe('GetUnassignedBeneficientsQueryDto', () => {
  it('debería validar con todos los campos ausentes (todos opcionales)', async () => {
    const dto = plainToInstance(GetUnassignedBeneficientsQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería validar con todos los campos opcionales presentes', async () => {
    const dto = plainToInstance(GetUnassignedBeneficientsQueryDto, {
      firstname: 'María',
      firstLastname: 'López',
      secondLastname: 'García',
      page: 1,
      limit: 10,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar firstname que no sea string', async () => {
    const dto = plainToInstance(GetUnassignedBeneficientsQueryDto, {
      firstname: 123,
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'firstname')).toBeDefined();
  });

  it('debería aplicar defaults de paginación (page=1, limit=5)', () => {
    const dto = plainToInstance(GetUnassignedBeneficientsQueryDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(5);
  });

  it('debería rechazar limit mayor a 100', async () => {
    const dto = plainToInstance(GetUnassignedBeneficientsQueryDto, {
      limit: 101,
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'limit')).toBeDefined();
  });

  it('debería rechazar page menor a 1', async () => {
    const dto = plainToInstance(GetUnassignedBeneficientsQueryDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'page')).toBeDefined();
  });
});
