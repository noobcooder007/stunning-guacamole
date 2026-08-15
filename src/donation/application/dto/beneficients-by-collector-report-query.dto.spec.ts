import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  BeneficientsByCollectorReportQueryDto,
  MAX_REPORT_RANGE_MONTHS,
} from './beneficients-by-collector-report-query.dto';

function validBase() {
  return {
    fromMonth: '1',
    fromYear: '2026',
    toMonth: '6',
    toYear: '2026',
  };
}

describe('BeneficientsByCollectorReportQueryDto', () => {
  it('debería pasar validación con un rango válido', async () => {
    const dto = plainToInstance(
      BeneficientsByCollectorReportQueryDto,
      validBase(),
    );
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería pasar validación con includeSpecial y collectorNumber opcionales', async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      ...validBase(),
      includeSpecial: 'false',
      collectorNumber: '3',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.includeSpecial).toBe(false);
    expect(dto.collectorNumber).toBe(3);
  });

  it('debería rechazar fromMonth 0', async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      ...validBase(),
      fromMonth: '0',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'fromMonth')).toBe(true);
  });

  it('debería rechazar toMonth 13', async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      ...validBase(),
      toMonth: '13',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'toMonth')).toBe(true);
  });

  it('debería rechazar un rango invertido (periodo final antes del inicial)', async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      fromMonth: '6',
      fromYear: '2026',
      toMonth: '1',
      toYear: '2026',
    });
    const errors = await validate(dto);
    expect(
      errors.some((e) =>
        Object.keys(e.constraints ?? {}).includes('isPeriodRangeValid'),
      ),
    ).toBe(true);
  });

  it('debería rechazar includeSpecial con valor no booleano', async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      ...validBase(),
      includeSpecial: 'not-a-boolean',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'includeSpecial')).toBe(true);
  });

  it('debería tratar un collectorNumber vacío como no filtrado (undefined)', async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      ...validBase(),
      collectorNumber: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.collectorNumber).toBeUndefined();
  });

  it(`debería rechazar un rango mayor a ${MAX_REPORT_RANGE_MONTHS} meses`, async () => {
    const dto = plainToInstance(BeneficientsByCollectorReportQueryDto, {
      fromMonth: '1',
      fromYear: '2020',
      toMonth: '12',
      toYear: '2026',
    });
    const errors = await validate(dto);
    expect(
      errors.some((e) =>
        Object.keys(e.constraints ?? {}).includes('isPeriodRangeValid'),
      ),
    ).toBe(true);
  });
});
