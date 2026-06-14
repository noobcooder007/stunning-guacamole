import { GetCollectorPaginatedHandler } from './get-collector-paginated.handler';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';

describe('GetCollectorPaginatedHandler', () => {
  let handler: GetCollectorPaginatedHandler;
  let collectorQueryService: { searchCollectors: jest.Mock };

  beforeEach(() => {
    collectorQueryService = { searchCollectors: jest.fn() };
    handler = new GetCollectorPaginatedHandler({} as any, collectorQueryService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    collectorQueryService.searchCollectors.mockResolvedValue(expected);
    const query = new GetCollectorQueryParams(undefined, undefined, undefined, undefined, undefined, undefined, 1, 10);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(collectorQueryService.searchCollectors).toHaveBeenCalledWith(query);
  });
});
