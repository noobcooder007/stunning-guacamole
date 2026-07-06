import { GetCollectorsActiveListHandler } from './get-collectors-active-list.handler';
import { GetCollectorsActiveListQuery } from '@/community/application/query/get-collectors-active-list.query';

describe('GetCollectorsActiveListHandler', () => {
  let handler: GetCollectorsActiveListHandler;
  let collectorQueryService: { getActiveList: jest.Mock };
  const datasource = {} as any;

  beforeEach(() => {
    collectorQueryService = { getActiveList: jest.fn() };
    handler = new GetCollectorsActiveListHandler(
      datasource,
      collectorQueryService as any,
    );
  });

  it('debería delegar en collectorQueryService y devolver ok con el resultado', async () => {
    const expected = [{ id: '1', name: 'Juan Pérez' }];
    collectorQueryService.getActiveList.mockResolvedValue(expected);
    const query = new GetCollectorsActiveListQuery();

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(collectorQueryService.getActiveList).toHaveBeenCalledWith(query);
  });
});
