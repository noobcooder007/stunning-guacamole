import {
  settlementLetterTemplate,
  SettlementLetterData,
} from './settlement-letter.template';

function makeLetter(
  overrides: Partial<SettlementLetterData> = {},
): SettlementLetterData {
  return {
    collectorName: 'Juan Pérez García',
    collectorNumber: 3,
    periodLabel: 'JUN2026',
    receipts: [
      {
        folio: 'F-001',
        beneficientName: 'María López',
        beneficientNumber: 42,
        amount: 500,
        currency: 'MXN',
        periodLabel: 'JUN2026',
      },
    ],
    totalCollected: 500,
    commissionPercent: 10,
    commissionAmount: 50,
    nomina: 20,
    transportAllowance: 10,
    netCommission: 40,
    currency: 'MXN',
    ...overrides,
  };
}

describe('settlementLetterTemplate', () => {
  it('debería retornar un TDocumentDefinitions con content', () => {
    const doc = settlementLetterTemplate([makeLetter()]);

    expect(doc).toBeDefined();
    expect(doc.content).toBeDefined();
    expect(Array.isArray(doc.content)).toBe(true);
  });

  it('debería generar un elemento de content por carta', () => {
    const doc = settlementLetterTemplate([makeLetter(), makeLetter()]);

    expect((doc.content as any[]).length).toBe(2);
  });

  it('debería agregar pageBreak en todas las cartas excepto la última', () => {
    const doc = settlementLetterTemplate([
      makeLetter(),
      makeLetter(),
      makeLetter(),
    ]);
    const content = doc.content as any[];

    expect(content[0].pageBreak).toBe('after');
    expect(content[1].pageBreak).toBe('after');
    expect(content[2].pageBreak).toBeUndefined();
  });

  it('no debería agregar pageBreak cuando solo hay una carta', () => {
    const doc = settlementLetterTemplate([makeLetter()]);
    const content = doc.content as any[];

    expect(content[0].pageBreak).toBeUndefined();
  });

  it('debería incluir el defaultStyle con la fuente Roboto', () => {
    const doc = settlementLetterTemplate([makeLetter()]);

    expect(doc.defaultStyle).toMatchObject({ font: 'Roboto' });
  });

  it('debería retornar content vacío para un array de cartas vacío', () => {
    const doc = settlementLetterTemplate([]);

    expect((doc.content as any[]).length).toBe(0);
  });

  it('debería incluir la nota de tipo de cambio cuando la liquidación incluye USD', () => {
    const doc = settlementLetterTemplate([
      makeLetter({ exchangeRateUsdToMxn: 18.25 }),
    ]);

    expect(JSON.stringify(doc)).toContain('18.2500');
  });

  it('no debería incluir la nota de tipo de cambio cuando la liquidación es 100% MXN', () => {
    const doc = settlementLetterTemplate([makeLetter()]);

    expect(JSON.stringify(doc)).not.toContain('tipo de cambio');
  });
});
