import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EfficiencyReportDto } from './efficiency-report.dto';

function validBase() {
  return {
    month: '6',
    year: '2024',
    initialDonation: '100',
    finalDonation: '500',
    frequency: '1',
  };
}

describe('EfficiencyReportDto', () => {
  it('debería pasar validación con los campos requeridos', async () => {
    const dto = plainToInstance(EfficiencyReportDto, validBase());
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería pasar validación con collectorNum opcional', async () => {
    const dto = plainToInstance(EfficiencyReportDto, {
      ...validBase(),
      collectorNum: '3',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('month / year (requeridos)', () => {
    it('debería rechazar mes fuera de rango', async () => {
      const dto = plainToInstance(EfficiencyReportDto, {
        ...validBase(),
        month: '13',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar año menor a 2000', async () => {
      const dto = plainToInstance(EfficiencyReportDto, {
        ...validBase(),
        year: '1999',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });
  });

  describe('initialDonation / finalDonation (requeridos)', () => {
    it('debería rechazar montos negativos', async () => {
      const dto = plainToInstance(EfficiencyReportDto, {
        ...validBase(),
        initialDonation: '-1',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'initialDonation')).toBe(true);
    });

    it('debería rechazar cuando finalDonation falta', async () => {
      const dto = plainToInstance(EfficiencyReportDto, {
        month: '6',
        year: '2024',
        initialDonation: '100',
        frequency: '1',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'finalDonation')).toBe(true);
    });
  });

  describe('frequency (requerido)', () => {
    it('debería rechazar frecuencia menor a 1', async () => {
      const dto = plainToInstance(EfficiencyReportDto, {
        ...validBase(),
        frequency: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'frequency')).toBe(true);
    });
  });

  describe('collectorNum (opcional)', () => {
    it('debería rechazar cero', async () => {
      const dto = plainToInstance(EfficiencyReportDto, {
        ...validBase(),
        collectorNum: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'collectorNum')).toBe(true);
    });
  });
});
