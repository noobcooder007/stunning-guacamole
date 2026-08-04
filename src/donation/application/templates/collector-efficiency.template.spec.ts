import {
  collectorEfficiencyTemplate,
  CollectorEfficiencyPdfData,
} from './collector-efficiency.template';

function makeEfficiencyData(
  overrides: Partial<CollectorEfficiencyPdfData> = {},
): CollectorEfficiencyPdfData {
  return {
    collectorName: 'Juan Pérez García',
    collectorNumber: 3,
    generatedAt: '2026-06-14',
    efficiency: {
      collectorId: '01907c2a-0000-7000-8000-000000000001',
      byPeriod: [
        {
          periodId: '01907c2a-0000-7000-8000-000000000010',
          month: 6,
          year: 2026,
          periodStatus: 'OPEN',
          assignedAmountMxn: 1000,
          assignedAmountUsd: 0,
          assignedAmountConsolidatedMxn: 1000,
          assignedCount: 5,
          collectedAmountMxn: 800,
          collectedAmountUsd: 0,
          collectedAmountConsolidatedMxn: 800,
          collectedCount: 4,
          pendingAmountMxn: 200,
          pendingAmountUsd: 0,
          pendingAmountConsolidatedMxn: 200,
          pendingCount: 1,
          collectionRate: 80,
        },
      ],
      byYear: [
        {
          year: 2026,
          assignedAmountMxn: 5000,
          assignedAmountUsd: 0,
          assignedAmountConsolidatedMxn: 5000,
          assignedCount: 20,
          collectedAmountMxn: 4000,
          collectedAmountUsd: 0,
          collectedAmountConsolidatedMxn: 4000,
          collectedCount: 16,
          pendingAmountMxn: 1000,
          pendingAmountUsd: 0,
          pendingAmountConsolidatedMxn: 1000,
          pendingCount: 4,
          collectionRate: 80,
        },
      ],
      historical: {
        assignedAmountMxn: 12000,
        assignedAmountUsd: 0,
        assignedAmountConsolidatedMxn: 12000,
        assignedCount: 60,
        collectedAmountMxn: 10000,
        collectedAmountUsd: 0,
        collectedAmountConsolidatedMxn: 10000,
        collectedCount: 50,
        pendingAmountMxn: 2000,
        pendingAmountUsd: 0,
        pendingAmountConsolidatedMxn: 2000,
        pendingCount: 10,
        collectionRate: 83.33,
      },
    },
    ...overrides,
  };
}

describe('collectorEfficiencyTemplate', () => {
  it('debería retornar un TDocumentDefinitions con content', () => {
    const doc = collectorEfficiencyTemplate(makeEfficiencyData());

    expect(doc).toBeDefined();
    expect(doc.content).toBeDefined();
  });

  it('debería manejar byPeriod vacío', () => {
    const data = makeEfficiencyData();
    data.efficiency.byPeriod = [];
    expect(() => collectorEfficiencyTemplate(data)).not.toThrow();
  });

  it('debería manejar byYear vacío', () => {
    const data = makeEfficiencyData();
    data.efficiency.byYear = [];
    expect(() => collectorEfficiencyTemplate(data)).not.toThrow();
  });

  it('debería incluir el nombre del colector en el documento', () => {
    const doc = collectorEfficiencyTemplate(makeEfficiencyData());
    const docStr = JSON.stringify(doc);
    expect(docStr).toContain('Juan Pérez García');
  });

  it('debería mostrar N/D cuando el consolidado en MXN no es calculable', () => {
    const data = makeEfficiencyData();
    data.efficiency.historical.assignedAmountConsolidatedMxn = null;
    data.efficiency.historical.collectionRate = null;
    const doc = collectorEfficiencyTemplate(data);
    const docStr = JSON.stringify(doc);
    expect(docStr).toContain('N/D');
  });
});
