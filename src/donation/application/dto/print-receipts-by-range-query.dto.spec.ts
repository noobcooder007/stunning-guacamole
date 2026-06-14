import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrintReceiptsByRangeQueryDto } from './print-receipts-by-range-query.dto';

function validBase() {
  return { month: '6', year: '2024', fromSequence: '1', toSequence: '10' };
}

describe('PrintReceiptsByRangeQueryDto', () => {
  it('debería pasar validación con los campos requeridos mínimos', async () => {
    const dto = plainToInstance(PrintReceiptsByRangeQueryDto, validBase());
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería pasar validación con todos los campos', async () => {
    const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
      ...validBase(),
      collectorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      collectorNumber: '3',
      firstname: 'Juan',
      firstLastname: 'García',
      secondLastname: 'López',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('month (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const { month: _, ...rest } = validBase();
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar mes 0', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        month: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });

    it('debería rechazar mes 13', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        month: '13',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'month')).toBe(true);
    });
  });

  describe('year (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const { year: _, ...rest } = validBase();
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });

    it('debería rechazar año menor a 2000', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        year: '1999',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'year')).toBe(true);
    });
  });

  describe('fromSequence (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const { fromSequence: _, ...rest } = validBase();
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'fromSequence')).toBe(true);
    });

    it('debería rechazar valor 0', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        fromSequence: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'fromSequence')).toBe(true);
    });

    it('debería aceptar 1 como valor mínimo', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        fromSequence: '1',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('toSequence (requerido)', () => {
    it('debería rechazar cuando falta', async () => {
      const { toSequence: _, ...rest } = validBase();
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'toSequence')).toBe(true);
    });

    it('debería rechazar valor 0', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        toSequence: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'toSequence')).toBe(true);
    });

    it('debería aceptar rango donde toSequence == fromSequence (un solo recibo)', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        fromSequence: '5',
        toSequence: '5',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('collectorId (opcional)', () => {
    it('debería rechazar valor que no es UUID', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        collectorId: 'no-es-uuid',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'collectorId')).toBe(true);
    });
  });

  describe('collectorNumber (opcional)', () => {
    it('debería rechazar valor 0', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        collectorNumber: '0',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'collectorNumber')).toBe(true);
    });
  });

  describe('nombres (opcionales)', () => {
    it('debería rechazar firstname que supera 100 caracteres', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        firstname: 'A'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'firstname')).toBe(true);
    });

    it('debería rechazar firstLastname que supera 100 caracteres', async () => {
      const dto = plainToInstance(PrintReceiptsByRangeQueryDto, {
        ...validBase(),
        firstLastname: 'B'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'firstLastname')).toBe(true);
    });
  });
});
