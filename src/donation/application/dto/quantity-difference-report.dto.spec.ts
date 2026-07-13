import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QuantityDifferenceReportDto } from './quantity-difference-report.dto';

function validBase() {
  return { month: '6', year: '2024' };
}

describe('QuantityDifferenceReportDto', () => {
  it('debería pasar validación con mes y año válidos', async () => {
    const dto = plainToInstance(QuantityDifferenceReportDto, validBase());
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('month (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const dto = plainToInstance(QuantityDifferenceReportDto, {
        year: '2024',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar mes 0', async () => {
      const dto = plainToInstance(QuantityDifferenceReportDto, {
        ...validBase(),
        month: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar mes 13', async () => {
      const dto = plainToInstance(QuantityDifferenceReportDto, {
        ...validBase(),
        month: '13',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });
  });

  describe('year (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const dto = plainToInstance(QuantityDifferenceReportDto, {
        month: '6',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });

    it('debería rechazar año menor a 2000', async () => {
      const dto = plainToInstance(QuantityDifferenceReportDto, {
        ...validBase(),
        year: '1999',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });
  });
});
