import { GetCollectorEfficiencyHandler } from './get-collector-efficiency.handler';
import { GetCollectorEfficiencyQuery } from '@/donation/application/query/get-collector-efficiency.query';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';

describe('GetCollectorEfficiencyHandler', () => {
  let handler: GetCollectorEfficiencyHandler;
  let efficiencyService: { getEfficiency: jest.Mock };

  beforeEach(() => {
    efficiencyService = { getEfficiency: jest.fn() };
    handler = new GetCollectorEfficiencyHandler(efficiencyService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { collectorId: COLLECTOR_ID, byPeriod: [], byYear: [], historical: {} };
    efficiencyService.getEfficiency.mockResolvedValue(expected);
    const query = new GetCollectorEfficiencyQuery(COLLECTOR_ID);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(efficiencyService.getEfficiency).toHaveBeenCalledWith(COLLECTOR_ID);
  });
});
