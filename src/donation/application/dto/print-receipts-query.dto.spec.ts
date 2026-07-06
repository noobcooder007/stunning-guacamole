import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrintReceiptsQueryDto } from './print-receipts-query.dto';

function validBase() {
  return { month: '6', year: '2024' };
}

describe('PrintReceiptsQueryDto', () => {
  it('debería pasar validación con mes y año solamente', async () => {
    const dto = plainToInstance(PrintReceiptsQueryDto, validBase());
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('month (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, { year: '2024' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar mes 0', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        month: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar mes 13', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        month: '13',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería aceptar meses válidos (1-12)', async () => {
      for (const month of ['1', '6', '12']) {
        const dto = plainToInstance(PrintReceiptsQueryDto, {
          ...validBase(),
          month,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  describe('year (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, { month: '6' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });

    it('debería rechazar año menor a 2000', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        year: '1999',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });

    it('debería aceptar año válido (>= 2000)', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        year: '2024',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('collectorId (opcional)', () => {
    it('debería aceptar un UUID válido', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        collectorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería rechazar un valor que no es UUID', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        collectorId: 'no-es-uuid',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'collectorId')).toBe(true);
    });
  });

  describe('collectorNumber (opcional)', () => {
    it('debería aceptar un número entero positivo', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        collectorNumber: '5',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería rechazar cero', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        collectorNumber: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'collectorNumber')).toBe(true);
    });
  });

  describe('firstname / firstLastname / secondLastname (opcionales)', () => {
    it('debería aceptar nombres válidos', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        firstname: 'Juan',
        firstLastname: 'García',
        secondLastname: 'López',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería rechazar firstname mayor a 100 caracteres', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        firstname: 'A'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'firstname')).toBe(true);
    });
  });

  describe('type (opcional)', () => {
    it('debería aceptar RECURRING', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        type: 'RECURRING',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería aceptar SPECIAL', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        type: 'SPECIAL',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería rechazar un tipo inválido', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        type: 'UNKNOWN',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'type')).toBe(true);
    });
  });

  describe('fromSequence / toSequence (opcionales, activan modo rango)', () => {
    it('debería aceptar rango válido', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        fromSequence: '1',
        toSequence: '50',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería rechazar fromSequence igual a 0', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        fromSequence: '0',
        toSequence: '10',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'fromSequence')).toBe(true);
    });

    it('debería rechazar toSequence igual a 0', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        fromSequence: '1',
        toSequence: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'toSequence')).toBe(true);
    });

    it('debería aceptar rango de un solo recibo (from == to)', async () => {
      const dto = plainToInstance(PrintReceiptsQueryDto, {
        ...validBase(),
        fromSequence: '5',
        toSequence: '5',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  it('debería aceptar todos los filtros combinados', async () => {
    const dto = plainToInstance(PrintReceiptsQueryDto, {
      collectorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      collectorNumber: '3',
      firstname: 'Juan',
      firstLastname: 'García',
      secondLastname: 'López',
      month: '6',
      year: '2024',
      type: 'RECURRING',
      fromSequence: '1',
      toSequence: '20',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
