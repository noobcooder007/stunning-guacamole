import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterBulkCollectorPaymentsDto } from './register-bulk-collector-payments.dto';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

const validPayload = {
  paymentMethod: CollectorPaymentMethod.TRANSFER,
  paidAt: '2026-06-13T12:00:00.000Z',
};

describe('RegisterBulkCollectorPaymentsDto', () => {
  it('debería validar con datos mínimos correctos', async () => {
    const dto = plainToInstance(RegisterBulkCollectorPaymentsDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar reference y notes opcionales', async () => {
    const dto = plainToInstance(RegisterBulkCollectorPaymentsDto, {
      ...validPayload,
      reference: 'TXN-001',
      notes: 'Pago de junio',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar paymentMethod inválido', async () => {
    const dto = plainToInstance(RegisterBulkCollectorPaymentsDto, {
      ...validPayload,
      paymentMethod: 'EFECTIVO',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'paymentMethod')).toBeDefined();
  });

  it('debería rechazar paidAt con formato no ISO', async () => {
    const dto = plainToInstance(RegisterBulkCollectorPaymentsDto, {
      ...validPayload,
      paidAt: '13/06/2026',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'paidAt')).toBeDefined();
  });

  it('debería aceptar ambos métodos de pago válidos', async () => {
    for (const paymentMethod of [
      CollectorPaymentMethod.CASH,
      CollectorPaymentMethod.TRANSFER,
    ]) {
      const dto = plainToInstance(RegisterBulkCollectorPaymentsDto, {
        ...validPayload,
        paymentMethod,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });
});
