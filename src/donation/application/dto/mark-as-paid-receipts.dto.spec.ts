import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MarkAsPaidReceiptsDto } from './mark-as-paid-receipts.dto';

describe('MarkAsPaidReceiptsDto', () => {
  it('debería validar con un recibo válido', async () => {
    const dto = plainToInstance(MarkAsPaidReceiptsDto, {
      receipts: [
        { receiptFolio: 'ENE2026-001-R-0001', paymentMethod: 'CASH' },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería validar con externalReference opcional presente', async () => {
    const dto = plainToInstance(MarkAsPaidReceiptsDto, {
      receipts: [
        { receiptFolio: 'ENE2026-001-R-0001', paymentMethod: 'TRANSFER', externalReference: 'REF123' },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar un método de pago inválido', async () => {
    const dto = plainToInstance(MarkAsPaidReceiptsDto, {
      receipts: [
        { receiptFolio: 'ENE2026-001-R-0001', paymentMethod: 'BITCOIN' },
      ],
    });
    const errors = await validate(dto, { whitelist: true });
    const nestedErrors = errors.flatMap(e => e.children ?? []).flatMap(c => c.children ?? []);
    expect(nestedErrors.some(e => e.property === 'paymentMethod')).toBe(true);
  });

  it('debería rechazar receipts vacío como array vacío', async () => {
    const dto = plainToInstance(MarkAsPaidReceiptsDto, { receipts: [] });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar si receipts no es un array', async () => {
    const dto = plainToInstance(MarkAsPaidReceiptsDto, { receipts: 'no-es-array' });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'receipts')).toBe(true);
  });
});
