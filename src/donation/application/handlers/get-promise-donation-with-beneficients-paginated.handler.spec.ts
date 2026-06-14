import { GetPromiseDonationsWithBeneficientPaginatedHandler } from './get-promise-donation-with-beneficients-paginated.handler';
import { GetPromiseDonationWithBeneficientsQueryParams } from '@/donation/application/query/get-promise-donation-with-beneficients-paginated.query';

describe('GetPromiseDonationsWithBeneficientPaginatedHandler', () => {
  let handler: GetPromiseDonationsWithBeneficientPaginatedHandler;
  let promisesQueryService: { searchPromiseDonationsWithBeneficients: jest.Mock };

  beforeEach(() => {
    promisesQueryService = { searchPromiseDonationsWithBeneficients: jest.fn() };
    handler = new GetPromiseDonationsWithBeneficientPaginatedHandler(
      {} as any,
      promisesQueryService as any,
    );
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    promisesQueryService.searchPromiseDonationsWithBeneficients.mockResolvedValue(expected);
    const query = new GetPromiseDonationWithBeneficientsQueryParams(undefined, undefined, undefined, undefined, true, 1, 10);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(promisesQueryService.searchPromiseDonationsWithBeneficients).toHaveBeenCalledWith(query);
  });
});
