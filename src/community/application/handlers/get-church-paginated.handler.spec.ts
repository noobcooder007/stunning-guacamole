import { GetChurchPaginatedHandler } from './get-church-paginated.handler';
import { GetChurchQueryParams } from '@/community/application/query/get-church-paginated.query';

describe('GetChurchPaginatedHandler', () => {
  let handler: GetChurchPaginatedHandler;
  let churchQueryService: { searchChurches: jest.Mock };

  beforeEach(() => {
    churchQueryService = { searchChurches: jest.fn() };
    handler = new GetChurchPaginatedHandler({} as any, churchQueryService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    churchQueryService.searchChurches.mockResolvedValue(expected);
    const query = new GetChurchQueryParams(undefined, undefined, undefined, undefined, undefined, 1, 10);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(churchQueryService.searchChurches).toHaveBeenCalledWith(query);
  });
});
