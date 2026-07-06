import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { PromiseDonationId } from '@/donation/domain/aggregates/promise-donation.aggregate';
import {
  Money,
  Receipt,
  ReceiptFolio,
  ReceiptId,
} from '@/donation/domain/aggregates/receipt.aggregate';
import { IReceiptPersistence, ReceiptMapper } from './receipt.mapper';

const ID = '01907c2a-0000-7000-8000-000000000001';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000002';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000003';
const PROMISE_ID = '01907c2a-0000-7000-8000-000000000004';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000005';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000006';
const NOW = new Date('2025-03-15T10:00:00.000Z');

function makeDomainReceipt(
  overrides: Partial<{
    promiseDonation: PromiseDonationId;
    beneficient: BeneficientId;
    month: number;
    year: number;
  }> = {},
): Receipt {
  return Receipt.recreate(ReceiptId.of(ID), {
    folio: ReceiptFolio.of('MAR2025-001-R-0001'),
    status: 'PENDING',
    type: 'RECURRING',
    origin: 'PROMISE',
    amount: Money.of(500, 'MXN'),
    printCount: 0,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: UserId.of(CREATED_BY),
    updatedBy: UserId.of(CREATED_BY),
    collector: CollectorId.of(COLLECTOR_ID),
    promiseDonation: overrides.promiseDonation,
    beneficient: overrides.beneficient,
    month: overrides.month,
    year: overrides.year,
  });
}

const validRaw: IReceiptPersistence = {
  id: ID,
  status: 'PENDING',
  folio: 'MAR2025-001-R-0001',
  type: 'RECURRING',
  origin: 'PROMISE',
  amount: 500,
  currency: 'MXN',
  paymentMethod: null,
  externalReference: null,
  promiseDonationId: PROMISE_ID,
  periodMonth: 3,
  periodYear: 2025,
  beneficientId: BENEFICIENT_ID,
  collectorId: COLLECTOR_ID,
  collectionPeriodId: PERIOD_ID,
  printCount: 0,
  lastPrintedAt: null,
  voidReason: null,
  paidAt: null,
  createdAt: NOW,
  updatedAt: NOW,
  createdBy: CREATED_BY,
  updatedBy: CREATED_BY,
  chainValidator: 'ABC123',
};

// ---------------------------------------------------------------------------
// toPersistence
// ---------------------------------------------------------------------------
describe('ReceiptMapper.toPersistence()', () => {
  it('debería mapear todos los campos básicos del agregado', () => {
    const receipt = makeDomainReceipt({
      promiseDonation: PromiseDonationId.of(PROMISE_ID),
      beneficient: BeneficientId.of(BENEFICIENT_ID),
      month: 3,
      year: 2025,
    });

    const raw = ReceiptMapper.toPersistence(receipt);

    expect(raw.id).toBe(ID);
    expect(raw.folio).toBe('MAR2025-001-R-0001');
    expect(raw.status).toBe('PENDING');
    expect(raw.type).toBe('RECURRING');
    expect(raw.origin).toBe('PROMISE');
    expect(raw.amount).toBe(500);
    expect(raw.currency).toBe('MXN');
    expect(raw.collectorId).toBe(COLLECTOR_ID);
    expect(raw.createdBy).toBe(CREATED_BY);
    expect(raw.promiseDonationId).toBe(PROMISE_ID);
    expect(raw.beneficientId).toBe(BENEFICIENT_ID);
    expect(raw.periodMonth).toBe(3);
    expect(raw.periodYear).toBe(2025);
  });

  it('debería dejar promiseDonationId como undefined cuando no hay promiseDonation', () => {
    const receipt = makeDomainReceipt({ month: 3, year: 2025 });

    const raw = ReceiptMapper.toPersistence(receipt);

    expect(raw.promiseDonationId).toBeFalsy();
  });

  it('debería dejar beneficientId como undefined cuando no hay beneficient', () => {
    const receipt = makeDomainReceipt({ month: 3, year: 2025 });

    const raw = ReceiptMapper.toPersistence(receipt);

    expect(raw.beneficientId).toBeFalsy();
  });

  it('debería usar createdAt como fallback de periodMonth y periodYear cuando no están definidos', () => {
    const receipt = makeDomainReceipt(); // sin month/year

    const raw = ReceiptMapper.toPersistence(receipt);

    expect(raw.periodMonth).toBe(NOW.getMonth() + 1);
    expect(raw.periodYear).toBe(NOW.getFullYear());
  });
});

// ---------------------------------------------------------------------------
// toDomain
// ---------------------------------------------------------------------------
describe('ReceiptMapper.toDomain()', () => {
  it('debería reconstruir el agregado con todos los campos', () => {
    const receipt = ReceiptMapper.toDomain(validRaw);

    expect(receipt._id.unpack()).toBe(ID);
    expect(receipt.folio.unpack()).toBe('MAR2025-001-R-0001');
    expect(receipt.status).toBe('PENDING');
    expect(receipt.type).toBe('RECURRING');
    expect(receipt.amount.amount).toBe(500);
    expect(receipt.amount.currency).toBe('MXN');
    expect(receipt.collector.unpack()).toBe(COLLECTOR_ID);
    expect(receipt.beneficient.unpack()).toBe(BENEFICIENT_ID);
    expect(receipt.promiseDonation.unpack()).toBe(PROMISE_ID);
    expect(receipt.periodMonth).toBe(3);
    expect(receipt.periodYear).toBe(2025);
    expect(receipt.chainValidator).toBe('ABC123');
    expect(receipt.createdBy.unpack()).toBe(CREATED_BY);
  });

  it('debería dejar beneficient como falsy cuando beneficientId es null', () => {
    const raw = { ...validRaw, beneficientId: null };

    const receipt = ReceiptMapper.toDomain(raw);

    expect(receipt.beneficient).toBeFalsy();
  });
});
