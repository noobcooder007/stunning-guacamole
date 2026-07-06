import { GetReceiptsPaginatedHandler } from './get-receipts-paginated.handler';
import { GetReceiptsQueryParams } from '@/donation/application/query/get-receipts-paginated.query';

describe('GetReceiptsPaginatedHandler', () => {
  let handler: GetReceiptsPaginatedHandler;
  let receiptsQueryService: { searchReceipts: jest.Mock };

  beforeEach(() => {
    receiptsQueryService = { searchReceipts: jest.fn() };
    handler = new GetReceiptsPaginatedHandler(
      {} as any,
      receiptsQueryService as any,
    );
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    receiptsQueryService.searchReceipts.mockResolvedValue(expected);
    const query = new GetReceiptsQueryParams(
      'PENDING',
      'RECURRING',
      undefined,
      1,
      10,
    );

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(receiptsQueryService.searchReceipts).toHaveBeenCalledWith(query);
  });
});
