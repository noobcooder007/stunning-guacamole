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
    totalAmountMxn: 500,
    totalAmountUsd: 0,
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

  it('debería mostrar MXN y USD por separado sin sumarlos, cuando el colector tiene ambas monedas', () => {
    const doc = collectorLetterTemplate([
      makeLetter({
        totalAmountMxn: 100,
        totalAmountUsd: 50,
        overdueTotalMxn: 20,
        overdueTotalUsd: 10,
        overdueReceipts: [
          {
            folio: 'F-002',
            beneficientName: 'Pedro Ruiz',
            beneficientNumber: 7,
            amount: 20,
            currency: 'MXN',
            recurrence: 'MONTHLY',
            period: 'MAY2026',
          },
        ],
      }),
    ]);
    const docStr = JSON.stringify(doc);

    // El total a cobrar nunca debe aparecer como una sola cifra mezclando
    // pesos y dólares (ej. 100+50=150 sin distinguir moneda).
    expect(docStr).toContain('$120.00 MXN');
    expect(docStr).toContain('$60.00 USD');
    expect(docStr).not.toContain('$150.00');
    expect(docStr).not.toContain('$180.00');
  });

  it('debería omitir la línea de USD cuando el colector no tiene recibos en esa moneda', () => {
    const doc = collectorLetterTemplate([makeLetter()]);
    const docStr = JSON.stringify(doc);

    expect(docStr).not.toContain('USD');
  });
});
