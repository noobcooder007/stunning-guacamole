import { GetBeneficientPaginatedHandler } from './get-beneficient-paginated.handler';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';

describe('GetBeneficientPaginatedHandler', () => {
  let handler: GetBeneficientPaginatedHandler;
  let beneficientQueryService: { searchBeneficients: jest.Mock };

  beforeEach(() => {
    beneficientQueryService = { searchBeneficients: jest.fn() };
    handler = new GetBeneficientPaginatedHandler({} as any, beneficientQueryService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    beneficientQueryService.searchBeneficients.mockResolvedValue(expected);
    const query = new GetBeneficientQueryParams('Juan', undefined, undefined, undefined, undefined, undefined, 1, 10);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(beneficientQueryService.searchBeneficients).toHaveBeenCalledWith(query);
  });
});
