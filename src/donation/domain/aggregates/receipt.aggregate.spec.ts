import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { PromiseDonationId } from '@/donation/domain/aggregates/promise-donation.aggregate';
import {
  Money,
  Receipt,
  ReceiptFolio,
  ReceiptId,
} from './receipt.aggregate';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000002';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000003';
const PROMISE_ID = '01907c2a-0000-7000-8000-000000000004';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000005';

function makePendingReceipt(overrides: { status?: 'PENDING' | 'PAID' | 'CANCELLED' } = {}) {
  return Receipt.recreate(ReceiptId.of(USER_ID), {
    folio: ReceiptFolio.of('ENE2025-001-R-0001'),
    status: overrides.status ?? 'PENDING',
    type: 'RECURRING',
    origin: 'PROMISE',
    amount: Money.of(500, 'MXN'),
    printCount: 0,
    updatedAt: new Date(),
    createdAt: new Date(),
    createdBy: UserId.of(USER_ID),
    updatedBy: UserId.of(USER_ID),
    beneficient: BeneficientId.of(BENEFICIENT_ID),
    collector: CollectorId.of(COLLECTOR_ID),
  });
}

// ---------------------------------------------------------------------------
// Money VO
// ---------------------------------------------------------------------------
describe('Money', () => {
  it('debería crear una instancia válida', () => {
    const money = Money.of(500, 'MXN');
    expect(money.amount).toBe(500);
    expect(money.currency).toBe('MXN');
  });

  it('debería lanzar cuando amount es 0', () => {
    expect(() => Money.of(0, 'MXN')).toThrow();
  });

  it('debería lanzar cuando amount es negativo', () => {
    expect(() => Money.of(-100, 'MXN')).toThrow();
  });

  it('debería lanzar cuando currency es null', () => {
    expect(() => Money.of(500, null as any)).toThrow();
  });

  it('unpack() debería devolver amount y currency', () => {
    const money = Money.of(250, 'USD');
    expect(money.unpack()).toEqual({ amount: 250, currency: 'USD' });
  });
});

// ---------------------------------------------------------------------------
// ReceiptFolio VO
// ---------------------------------------------------------------------------
describe('ReceiptFolio', () => {
  it('debería generar folio RECURRING con prefijo R', () => {
    const folio = ReceiptFolio.create(new Date(2025, 0, 15), '001', 1, 'RECURRING');
    expect(folio.unpack()).toBe('ENE2025-001-R-0001');
  });

  it('debería generar folio SPECIAL con prefijo S', () => {
    const folio = ReceiptFolio.create(new Date(2025, 5, 1), '042', 99, 'SPECIAL');
    expect(folio.unpack()).toBe('JUN2025-042-S-0099');
  });

  it('debería rellenar el sequence con ceros hasta 4 dígitos', () => {
    const folio = ReceiptFolio.create(new Date(2025, 2, 1), '001', 5, 'RECURRING');
    expect(folio.unpack()).toContain('-0005');
  });

  it('debería mapear correctamente todos los meses', () => {
    const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    months.forEach((abbr, idx) => {
      const folio = ReceiptFolio.create(new Date(2025, idx, 1), '001', 1, 'RECURRING');
      expect(folio.unpack()).toContain(abbr);
    });
  });

  it('of() debería preservar el valor tal cual', () => {
    const raw = 'DIC2024-007-S-0123';
    expect(ReceiptFolio.of(raw).unpack()).toBe(raw);
  });
});

// ---------------------------------------------------------------------------
// Receipt.createRecurring()
// ---------------------------------------------------------------------------
describe('Receipt.createRecurring()', () => {
  it('debería crear recibo con estado PENDING, tipo RECURRING y origen PROMISE', () => {
    const receipt = Receipt.createRecurring(
      ReceiptFolio.of('ENE2025-001-R-0001'),
      Money.of(500, 'MXN'),
      PromiseDonationId.of(PROMISE_ID),
      BeneficientId.of(BENEFICIENT_ID),
      CollectorId.of(COLLECTOR_ID),
      UserId.of(USER_ID),
      'CHAIN123',
      1,
      2025,
    );

    expect(receipt.status).toBe('PENDING');
    expect(receipt.type).toBe('RECURRING');
    expect(receipt.origin).toBe('PROMISE');
    expect(receipt.printCount).toBe(0);
    expect(receipt.periodMonth).toBe(1);
    expect(receipt.periodYear).toBe(2025);
  });

  it('debería asignar collectionPeriodId cuando se provee', () => {
    const receipt = Receipt.createRecurring(
      ReceiptFolio.of('ENE2025-001-R-0001'),
      Money.of(500, 'MXN'),
      PromiseDonationId.of(PROMISE_ID),
      BeneficientId.of(BENEFICIENT_ID),
      CollectorId.of(COLLECTOR_ID),
      UserId.of(USER_ID),
      'CHAIN123',
      1,
      2025,
      PERIOD_ID,
    );

    expect(receipt.collectionPeriodId).toBe(PERIOD_ID);
  });
});

// ---------------------------------------------------------------------------
// Receipt.createSpecial()
// ---------------------------------------------------------------------------
describe('Receipt.createSpecial()', () => {
  it('debería crear recibo con estado PENDING, tipo SPECIAL y origen NON_PROMISE', () => {
    const receipt = Receipt.createSpecial(
      ReceiptFolio.of('ENE2025-001-S-0001'),
      Money.of(300, 'MXN'),
      CollectorId.of(COLLECTOR_ID),
      UserId.of(USER_ID),
      'CHAIN456',
      BeneficientId.of(BENEFICIENT_ID),
      1,
      2025,
    );

    expect(receipt.status).toBe('PENDING');
    expect(receipt.type).toBe('SPECIAL');
    expect(receipt.origin).toBe('NON_PROMISE');
    expect(receipt.printCount).toBe(0);
    expect(receipt.periodMonth).toBe(1);
    expect(receipt.periodYear).toBe(2025);
  });

  it('debería lanzar si beneficientId es null', () => {
    expect(() =>
      Receipt.createSpecial(
        ReceiptFolio.of('ENE2025-001-S-0001'),
        Money.of(300, 'MXN'),
        CollectorId.of(COLLECTOR_ID),
        UserId.of(USER_ID),
        'CHAIN456',
        null,
        1,
        2025,
      ),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Receipt.markAsPaid()
// ---------------------------------------------------------------------------
describe('Receipt.markAsPaid()', () => {
  it('debería cambiar estado a PAID y registrar método de pago', () => {
    const receipt = makePendingReceipt();

    receipt.markAsPaid('CASH');

    expect(receipt.status).toBe('PAID');
    expect(receipt.paymentMethod).toBe('CASH');
    expect(receipt.paidAt).toBeInstanceOf(Date);
  });

  it('debería registrar referencia y periodo cuando se proveen', () => {
    const receipt = makePendingReceipt();

    receipt.markAsPaid('TRANSFER', PERIOD_ID, 'REF-001');

    expect(receipt.collectionPeriodId).toBe(PERIOD_ID);
    expect(receipt.externalReference).toBe('REF-001');
  });

  it('debería lanzar si el recibo ya está PAID', () => {
    const receipt = makePendingReceipt({ status: 'PAID' });
    expect(() => receipt.markAsPaid('CASH')).toThrow();
  });

  it('debería lanzar si el recibo está CANCELLED', () => {
    const receipt = makePendingReceipt({ status: 'CANCELLED' });
    expect(() => receipt.markAsPaid('CASH')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Receipt.cancel()
// ---------------------------------------------------------------------------
describe('Receipt.cancel()', () => {
  it('debería cancelar un recibo PENDING con la razón dada', () => {
    const receipt = makePendingReceipt();

    receipt.cancel('Error en captura', USER_ID);

    expect(receipt.status).toBe('CANCELLED');
    expect(receipt.voidReason).toBe('Error en captura');
  });

  it('debería actualizar updatedBy con el userId recibido', () => {
    const receipt = makePendingReceipt();
    const OTHER_ID = '01907c2a-0000-7000-8000-000000000099';

    receipt.cancel('Motivo', OTHER_ID);

    expect(receipt.updatedBy.unpack()).toBe(OTHER_ID);
  });

  it('debería lanzar si el recibo está PAID', () => {
    const receipt = makePendingReceipt({ status: 'PAID' });
    expect(() => receipt.cancel('Motivo', USER_ID)).toThrow();
  });

  it('debería lanzar si el recibo ya está CANCELLED', () => {
    const receipt = makePendingReceipt({ status: 'CANCELLED' });
    expect(() => receipt.cancel('Motivo', USER_ID)).toThrow();
  });

  it('debería lanzar si la razón es null', () => {
    const receipt = makePendingReceipt();
    expect(() => receipt.cancel(null, USER_ID)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Receipt.updatePrintCount()
// ---------------------------------------------------------------------------
describe('Receipt.updatePrintCount()', () => {
  it('debería incrementar printCount en 1', () => {
    const receipt = makePendingReceipt();
    expect(receipt.printCount).toBe(0);

    receipt.updatePrintCount();

    expect(receipt.printCount).toBe(1);
  });

  it('debería registrar lastPrintedAt', () => {
    const receipt = makePendingReceipt();

    receipt.updatePrintCount();

    expect(receipt.lastPrintedAt).toBeInstanceOf(Date);
  });

  it('shouldShowWatermark debería ser true después de imprimir', () => {
    const receipt = makePendingReceipt();
    expect(receipt.shouldShowWatermark).toBe(false);

    receipt.updatePrintCount();

    expect(receipt.shouldShowWatermark).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Receipt.generateValidationChain()
// ---------------------------------------------------------------------------
describe('Receipt.generateValidationChain()', () => {
  it('debería llamar al hasher con el formato correcto y almacenar los primeros 16 chars en mayúsculas', async () => {
    const id = '01907c2a-0000-7000-8000-000000000001';
    const receipt = Receipt.recreate(ReceiptId.of(id), {
      folio: ReceiptFolio.of('ENE2025-001-R-0001'),
      status: 'PENDING',
      type: 'RECURRING',
      origin: 'PROMISE',
      amount: Money.of(500, 'MXN'),
      printCount: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      createdBy: UserId.of(USER_ID),
      updatedBy: UserId.of(USER_ID),
      beneficient: BeneficientId.of(BENEFICIENT_ID),
      collector: CollectorId.of(COLLECTOR_ID),
    });

    const hasher = { hash: jest.fn().mockResolvedValue('abcdef1234567890EXTRA') };
    await receipt.generateValidationChain(hasher as any);

    const expectedData = `${id}|ENE2025-001-R-0001|500|${BENEFICIENT_ID}`;
    expect(hasher.hash).toHaveBeenCalledWith(expectedData);
    expect(receipt.chainValidator).toBe('ABCDEF1234567890');
  });

  it('debería usar "undefined" como beneficient cuando no hay beneficientId', async () => {
    const id = '01907c2a-0000-7000-8000-000000000001';
    const receipt = Receipt.recreate(ReceiptId.of(id), {
      folio: ReceiptFolio.of('ENE2025-001-R-0001'),
      status: 'PENDING',
      type: 'SPECIAL',
      origin: 'NON_PROMISE',
      amount: Money.of(500, 'MXN'),
      printCount: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      createdBy: UserId.of(USER_ID),
      updatedBy: UserId.of(USER_ID),
      collector: CollectorId.of(COLLECTOR_ID),
    });

    const hasher = { hash: jest.fn().mockResolvedValue('abcdef1234567890EXTRA') };
    await receipt.generateValidationChain(hasher as any);

    const [calledWith] = hasher.hash.mock.calls[0];
    expect(calledWith).toContain('|undefined');
  });
});
