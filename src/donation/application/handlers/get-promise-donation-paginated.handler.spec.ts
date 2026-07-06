import { GetPromiseDonationsPaginatedHandler } from './get-promise-donation-paginated.handler';
import { GetPromiseDonationQueryParams } from '@/donation/application/query/get-promise-donation-paginated.query';

describe('GetPromiseDonationsPaginatedHandler', () => {
  let handler: GetPromiseDonationsPaginatedHandler;
  let promisesQueryService: { searchPromiseDonations: jest.Mock };

  beforeEach(() => {
    promisesQueryService = { searchPromiseDonations: jest.fn() };
    handler = new GetPromiseDonationsPaginatedHandler(
      {} as any,
      promisesQueryService as any,
    );
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    promisesQueryService.searchPromiseDonations.mockResolvedValue(expected);
    const query = new GetPromiseDonationQueryParams(
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      1,
      10,
    );

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(promisesQueryService.searchPromiseDonations).toHaveBeenCalledWith(
      query,
    );
  });
});
