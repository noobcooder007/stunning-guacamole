import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetReceiptsQueryDto } from './get-receipts-query.dto';

describe('GetReceiptsQueryDto', () => {
  it('debería validar con todos los campos opcionales ausentes', async () => {
    const dto = plainToInstance(GetReceiptsQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería validar con todos los campos opcionales presentes y válidos', async () => {
    const dto = plainToInstance(GetReceiptsQueryDto, {
      collectorId: '01907c2a-0000-7000-8000-000000000001',
      folio: 'F-001',
      status: 'PAID',
      type: 'RECURRING',
      month: 6,
      year: 2026,
      page: 1,
      limit: 10,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar collectorId que no sea UUID', async () => {
    const dto = plainToInstance(GetReceiptsQueryDto, {
      collectorId: 'no-es-uuid',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'collectorId')).toBeDefined();
  });

  it('debería rechazar status inválido (fuera del enum)', async () => {
    const dto = plainToInstance(GetReceiptsQueryDto, { status: 'UNKNOWN' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'status')).toBeDefined();
  });

  it('debería rechazar type inválido (fuera del enum)', async () => {
    const dto = plainToInstance(GetReceiptsQueryDto, { type: 'INVALID' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'type')).toBeDefined();
  });

  it('debería rechazar month fuera del rango 1-12', async () => {
    const dtoLow = plainToInstance(GetReceiptsQueryDto, { month: 0 });
    const dtoHigh = plainToInstance(GetReceiptsQueryDto, { month: 13 });
    const errorsLow = await validate(dtoLow);
    const errorsHigh = await validate(dtoHigh);
    expect(errorsLow.find((e) => e.property === 'month')).toBeDefined();
    expect(errorsHigh.find((e) => e.property === 'month')).toBeDefined();
  });

  it('debería rechazar year menor a 2000', async () => {
    const dto = plainToInstance(GetReceiptsQueryDto, { year: 1999 });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'year')).toBeDefined();
  });

  it('debería aceptar los tres valores válidos de status', async () => {
    for (const status of ['PENDING', 'PAID', 'CANCELLED']) {
      const dto = plainToInstance(GetReceiptsQueryDto, { status });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'status')).toBeUndefined();
    }
  });
});
