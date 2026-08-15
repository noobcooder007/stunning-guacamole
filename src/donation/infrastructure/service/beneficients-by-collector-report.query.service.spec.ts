import {
  groupReceiptReportRows,
  ReceiptReportRow,
} from './beneficients-by-collector-report.query.service';

function makeRow(overrides: Partial<ReceiptReportRow> = {}): ReceiptReportRow {
  return {
    collectorNumber: 1,
    collectorFirstname: 'Juan',
    collectorFirstLastname: 'Pérez',
    collectorSecondLastname: null,
    beneficientNumber: 10,
    beneficientFirstname: 'María',
    beneficientFirstLastname: 'López',
    beneficientSecondLastname: 'García',
    folio: '012026-1-R-001',
    type: 'RECURRING',
    amount: '100.00',
    currency: 'MXN',
    periodMonth: 1,
    periodYear: 2026,
    paidAt: new Date('2026-01-15'),
    paidPeriodMonth: 1,
    paidPeriodYear: 2026,
    ...overrides,
  };
}

describe('groupReceiptReportRows', () => {
  it('debería agrupar por colector, bienhechor y periodo', () => {
    const rows = [
      makeRow(),
      makeRow({ periodMonth: 2, folio: '022026-1-R-001' }),
      makeRow({
        collectorNumber: 2,
        collectorFirstname: 'Ana',
        beneficientNumber: 20,
        folio: '012026-2-R-001',
      }),
    ];

    const collectors = groupReceiptReportRows(rows);

    expect(collectors).toHaveLength(2);
    expect(collectors[0].collectorNumber).toBe(1);
    expect(collectors[0].beneficients).toHaveLength(1);
    expect(collectors[0].beneficients[0].periods).toHaveLength(2);
    expect(collectors[1].collectorNumber).toBe(2);
  });

  it('debería marcar isDelayed = true cuando el periodo pagado difiere del periodo debido', () => {
    const rows = [
      makeRow({
        periodMonth: 1,
        periodYear: 2026,
        paidPeriodMonth: 3,
        paidPeriodYear: 2026,
      }),
    ];

    const [collector] = groupReceiptReportRows(rows);
    const receipt = collector.beneficients[0].periods[0].receipts[0];

    expect(receipt.isDelayed).toBe(true);
    expect(receipt.paidPeriodMonth).toBe(3);
  });

  it('debería marcar isDelayed = false cuando se pagó en el mismo periodo al que se debía', () => {
    const rows = [
      makeRow({
        periodMonth: 1,
        periodYear: 2026,
        paidPeriodMonth: 1,
        paidPeriodYear: 2026,
      }),
    ];

    const [collector] = groupReceiptReportRows(rows);
    const receipt = collector.beneficients[0].periods[0].receipts[0];

    expect(receipt.isDelayed).toBe(false);
  });

  it('debería marcar isDelayed = null cuando el recibo no tiene CollectionPeriod vinculado', () => {
    const rows = [makeRow({ paidPeriodMonth: null, paidPeriodYear: null })];

    const [collector] = groupReceiptReportRows(rows);
    const receipt = collector.beneficients[0].periods[0].receipts[0];

    expect(receipt.isDelayed).toBeNull();
  });

  it('debería acumular los totales por bienhechor separados por moneda', () => {
    const rows = [
      makeRow({ amount: '100.00', currency: 'MXN' }),
      makeRow({ amount: '50.00', currency: 'MXN', periodMonth: 2 }),
      makeRow({ amount: '20.00', currency: 'USD', periodMonth: 3 }),
    ];

    const [collector] = groupReceiptReportRows(rows);
    const beneficient = collector.beneficients[0];

    expect(beneficient.totalDonatedMxn).toBe(150);
    expect(beneficient.totalDonatedUsd).toBe(20);
  });

  it('debería regresar un arreglo vacío cuando no hay filas', () => {
    expect(groupReceiptReportRows([])).toEqual([]);
  });
});
