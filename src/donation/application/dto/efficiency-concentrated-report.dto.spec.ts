import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EfficiencyConcentratedReportDto } from './efficiency-concentrated-report.dto';

function validBase() {
  return {
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    initialPercentage: '0',
    finalPercentage: '50',
    efficiencyType: 'HISTORICAL',
  };
}

describe('EfficiencyConcentratedReportDto', () => {
  it('debería pasar validación con los campos requeridos', async () => {
    const dto = plainToInstance(EfficiencyConcentratedReportDto, validBase());
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería pasar validación con collectorNum opcional', async () => {
    const dto = plainToInstance(EfficiencyConcentratedReportDto, {
      ...validBase(),
      collectorNum: '3',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('startDate / endDate (requeridos)', () => {
    it('debería rechazar una fecha inválida', async () => {
      const dto = plainToInstance(EfficiencyConcentratedReportDto, {
        ...validBase(),
        startDate: 'no-es-fecha',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'startDate')).toBe(true);
    });
  });

  describe('initialPercentage / finalPercentage (requeridos)', () => {
    it('debería rechazar porcentaje negativo', async () => {
      const dto = plainToInstance(EfficiencyConcentratedReportDto, {
        ...validBase(),
        initialPercentage: '-1',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'initialPercentage')).toBe(true);
    });

    it('debería rechazar porcentaje mayor a 100', async () => {
      const dto = plainToInstance(EfficiencyConcentratedReportDto, {
        ...validBase(),
        finalPercentage: '101',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'finalPercentage')).toBe(true);
    });
  });

  describe('efficiencyType (requerido)', () => {
    it('debería aceptar PERIOD, YEAR e HISTORICAL', async () => {
      for (const efficiencyType of ['PERIOD', 'YEAR', 'HISTORICAL']) {
        const dto = plainToInstance(EfficiencyConcentratedReportDto, {
          ...validBase(),
          efficiencyType,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('debería rechazar un tipo inválido', async () => {
      const dto = plainToInstance(EfficiencyConcentratedReportDto, {
        ...validBase(),
        efficiencyType: 'UNKNOWN',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'efficiencyType')).toBe(true);
    });
  });

  describe('collectorNum (opcional)', () => {
    it('debería rechazar cero', async () => {
      const dto = plainToInstance(EfficiencyConcentratedReportDto, {
        ...validBase(),
        collectorNum: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'collectorNum')).toBe(true);
    });
  });
});
