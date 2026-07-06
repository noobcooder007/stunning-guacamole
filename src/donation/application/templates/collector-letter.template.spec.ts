import {
  collectorLetterTemplate,
  CollectorLetterData,
} from './collector-letter.template';

function makeLetter(
  overrides: Partial<CollectorLetterData> = {},
): CollectorLetterData {
  return {
    collectorName: 'Juan Pérez García',
    collectorNumber: 3,
    period: 'JUN2026',
    receipts: [
      {
        folio: 'F-001',
        beneficientName: 'María López',
        beneficientNumber: 42,
        amount: 500,
        currency: 'MXN',
        recurrence: 'MONTHLY',
      },
    ],
    totalAmount: 500,
    currency: 'MXN',
    ...overrides,
  };
}

describe('collectorLetterTemplate', () => {
  it('debería retornar un TDocumentDefinitions con content y defaultStyle', () => {
    const doc = collectorLetterTemplate([makeLetter()]);

    expect(doc).toBeDefined();
    expect(doc.content).toBeDefined();
    expect(Array.isArray(doc.content)).toBe(true);
    expect(doc.defaultStyle).toMatchObject({ font: 'Roboto' });
  });

  it('debería generar un elemento por carta', () => {
    const doc = collectorLetterTemplate([makeLetter(), makeLetter()]);
    expect((doc.content as any[]).length).toBe(2);
  });

  it('debería añadir pageBreak en todas excepto la última', () => {
    const doc = collectorLetterTemplate([
      makeLetter(),
      makeLetter(),
      makeLetter(),
    ]);
    const content = doc.content as any[];

    expect(content[0].pageBreak).toBe('after');
    expect(content[1].pageBreak).toBe('after');
    expect(content[2].pageBreak).toBeUndefined();
  });

  it('no debería añadir pageBreak cuando hay una sola carta', () => {
    const doc = collectorLetterTemplate([makeLetter()]);
    expect((doc.content as any[])[0].pageBreak).toBeUndefined();
  });

  it('debería manejar lista de recibos vacía', () => {
    expect(() =>
      collectorLetterTemplate([makeLetter({ receipts: [] })]),
    ).not.toThrow();
  });

  it('debería retornar content vacío para array vacío de cartas', () => {
    const doc = collectorLetterTemplate([]);
    expect((doc.content as any[]).length).toBe(0);
  });
});
