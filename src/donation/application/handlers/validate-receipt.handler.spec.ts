import { ValidateReceiptHandler } from './validate-receipt.handler';
import { ValidateReceiptQuery } from '@/donation/application/query/validate-receipt.query';

const ID = '01907c2a-0000-7000-8000-000000000001';
const FOLIO = 'ENE2025-001-R-0001';
const CHAIN = 'ABCDEF1234567890';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000002';

function makeReceipt(
  overrides: {
    chainValidator?: string | null;
    beneficientId?: string | null;
    amount?: number;
  } = {},
) {
  const beneficientId =
    'beneficientId' in overrides ? overrides.beneficientId : BENEFICIENT_ID;
  return {
    chainValidator:
      'chainValidator' in overrides ? overrides.chainValidator : CHAIN,
    _id: { unpack: () => ID },
    folio: { unpack: () => FOLIO },
    amount: {
      unpack: () => ({ amount: overrides.amount ?? 500 }),
      amount: overrides.amount ?? 500,
      currency: 'MXN',
    },
    beneficient:
      beneficientId != null ? { unpack: () => beneficientId } : undefined,
    status: 'PENDING',
  };
}

function makeHandler(
  receiptOrNull: unknown,
  hashReturnValue = CHAIN.toLowerCase() + 'EXTRA',
) {
  const receiptRepository = {
    findByFolio: jest.fn().mockResolvedValue(receiptOrNull),
  };
  const hasher = {
    hash: jest.fn().mockResolvedValue(hashReturnValue),
  };
  return {
    handler: new ValidateReceiptHandler(
      receiptRepository as any,
      hasher as any,
    ),
    receiptRepository,
    hasher,
  };
}

const query = new ValidateReceiptQuery(FOLIO);

describe('ValidateReceiptHandler', () => {
  it('debería devolver { valid: false } cuando el recibo no existe', async () => {
    const { handler } = makeHandler(null);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.valid).toBe(false);
  });

  it('debería devolver { valid: false } cuando el recibo no tiene chainValidator', async () => {
    const { handler } = makeHandler(makeReceipt({ chainValidator: null }));

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.valid).toBe(false);
  });

  it('debería devolver { valid: true } con los datos del recibo cuando el hash coincide', async () => {
    const { handler } = makeHandler(makeReceipt());

    const result = await handler.execute(query);

    expect(result.value.valid).toBe(true);
    expect(result.value.folio).toBe(FOLIO);
    expect(result.value.status).toBe('PENDING');
    expect(result.value.amount).toBe(500);
    expect(result.value.currency).toBe('MXN');
  });

  it('debería devolver { valid: false } cuando ninguna combinación coincide con el hash', async () => {
    const { handler } = makeHandler(makeReceipt(), 'WRONGHASH0000000EXTRA');

    const result = await handler.execute(query);

    expect(result.value.valid).toBe(false);
  });

  it('debería intentar variantes sin beneficient (null y undefined) cuando no hay beneficient', async () => {
    const receipt = makeReceipt({ beneficientId: null });
    // Hasher nunca coincide: se fuerza a recorrer todas las combinaciones
    const { handler, hasher } = makeHandler(receipt, 'WRONGHASH0000000EXTRA');

    await handler.execute(query);

    const calledArgs: string[] = hasher.hash.mock.calls.map(
      ([d]: [string]) => d,
    );
    const hasNullVariant = calledArgs.some((d) => d.endsWith('|null'));
    const hasUndefinedVariant = calledArgs.some((d) =>
      d.endsWith('|undefined'),
    );
    expect(hasNullVariant).toBe(true);
    expect(hasUndefinedVariant).toBe(true);
  });

  it('debería intentar variante de amount como string por compatibilidad con legado', async () => {
    const receipt = makeReceipt();
    // Hasher never matches so all variants are tried
    const { handler, hasher } = makeHandler(receipt, 'WRONGHASH0000000EXTRA');

    await handler.execute(query);

    // amountVariants = [Number(500), 500] — both calls will have '500' in data
    expect(hasher.hash).toHaveBeenCalledTimes(2);
  });
});
