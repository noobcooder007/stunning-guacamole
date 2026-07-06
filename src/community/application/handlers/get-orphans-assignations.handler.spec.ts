import { GetOrphansAssignationsQueryHandler } from './get-orphans-assignations.handler';
import { GetOrphansAssignationsQuery } from '@/community/application/query/get-orphans-assignations.query';

describe('GetOrphansAssignationsQueryHandler', () => {
  let handler: GetOrphansAssignationsQueryHandler;
  let assignationsService: { getOrphans: jest.Mock };

  beforeEach(() => {
    assignationsService = { getOrphans: jest.fn() };
    handler = new GetOrphansAssignationsQueryHandler(
      {} as any,
      assignationsService as any,
    );
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = [{ id: '1' }];
    assignationsService.getOrphans.mockResolvedValue(expected);
    const query = new GetOrphansAssignationsQuery();

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(assignationsService.getOrphans).toHaveBeenCalledTimes(1);
  });
});
