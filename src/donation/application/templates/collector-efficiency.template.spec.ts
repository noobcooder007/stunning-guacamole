import {
  collectorEfficiencyTemplate,
  CollectorEfficiencyPdfData,
} from './collector-efficiency.template';

function makeEfficiencyData(overrides: Partial<CollectorEfficiencyPdfData> = {}): CollectorEfficiencyPdfData {
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
          assignedAmount: 1000,
          assignedCount: 5,
          collectedAmount: 800,
          collectedCount: 4,
          pendingAmount: 200,
          pendingCount: 1,
          collectionRate: 80,
        },
      ],
      byYear: [
        {
          year: 2026,
          assignedAmount: 5000,
          assignedCount: 20,
          collectedAmount: 4000,
          collectedCount: 16,
          pendingAmount: 1000,
          pendingCount: 4,
          collectionRate: 80,
        },
      ],
      historical: {
        assignedAmount: 12000,
        assignedCount: 60,
        collectedAmount: 10000,
        collectedCount: 50,
        pendingAmount: 2000,
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
});
