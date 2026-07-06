import { GetConsolidatedCollectorEfficiencyHandler } from './get-consolidated-collector-efficiency.handler';
import { GetConsolidatedCollectorEfficiencyQuery } from '@/donation/application/query/get-consolidated-collector-efficiency.query';

describe('GetConsolidatedCollectorEfficiencyHandler', () => {
  let handler: GetConsolidatedCollectorEfficiencyHandler;
  let efficiencyService: { getConsolidatedEfficiency: jest.Mock };

  beforeEach(() => {
    efficiencyService = { getConsolidatedEfficiency: jest.fn() };
    handler = new GetConsolidatedCollectorEfficiencyHandler(
      efficiencyService as any,
    );
  });

  it('debería delegar en el servicio y devolver el resultado consolidado', async () => {
    const expected = {
      byPeriod: [],
      byYear: [],
      historical: {
        collectors: [],
        totals: {
          assignedAmount: 0,
          assignedCount: 0,
          collectedAmount: 0,
          collectedCount: 0,
          pendingAmount: 0,
          pendingCount: 0,
          collectionRate: 0,
        },
      },
    };
    efficiencyService.getConsolidatedEfficiency.mockResolvedValue(expected);

    const result = await handler.execute(
      new GetConsolidatedCollectorEfficiencyQuery(),
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(efficiencyService.getConsolidatedEfficiency).toHaveBeenCalled();
  });
});
