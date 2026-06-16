import { GetBeneficientPaginatedHandler } from './get-beneficient-paginated.handler';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';

describe('GetBeneficientPaginatedHandler', () => {
  let handler: GetBeneficientPaginatedHandler;
  let beneficientQueryService: { getPaginated: jest.Mock };

  beforeEach(() => {
    beneficientQueryService = { getPaginated: jest.fn() };
    handler = new GetBeneficientPaginatedHandler({} as any, beneficientQueryService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    beneficientQueryService.getPaginated.mockResolvedValue(expected);
    const query = new GetBeneficientQueryParams('Juan', undefined, undefined, undefined, undefined, undefined, 1, 10);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(beneficientQueryService.getPaginated).toHaveBeenCalledWith(query);
  });
});
