import { GetActivesAssignationsHandler } from './get-actives-assignations.handler';
import { GetActiveAssignationsQuery } from '@/community/application/query/get-active-assignations.query';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';

describe('GetActivesAssignationsHandler', () => {
  let handler: GetActivesAssignationsHandler;
  let assignationsService: { getActivesWithBeneficients: jest.Mock };

  beforeEach(() => {
    assignationsService = { getActivesWithBeneficients: jest.fn() };
    handler = new GetActivesAssignationsHandler(
      {} as any,
      assignationsService as any,
    );
  });

  it('debería delegar al servicio y devolver Result.ok con el resultado', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    assignationsService.getActivesWithBeneficients.mockResolvedValue(expected);
    const query = new GetActiveAssignationsQuery(COLLECTOR_ID, 1, 10);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(assignationsService.getActivesWithBeneficients).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 10,
        collectorId: COLLECTOR_ID,
      },
    );
  });
});
