import { GetUnassignedBeneficientsHandler } from './get-unassigned-beneficients.handler';
import { GetUnassignedBeneficientsQuery } from '@/community/application/query/get-unassigned-beneficients.query';

describe('GetUnassignedBeneficientsHandler', () => {
  let handler: GetUnassignedBeneficientsHandler;
  let beneficientQueryService: { searchUnassigned: jest.Mock };
  const datasource = {} as any;

  beforeEach(() => {
    beneficientQueryService = { searchUnassigned: jest.fn() };
    handler = new GetUnassignedBeneficientsHandler(
      datasource,
      beneficientQueryService as any,
    );
  });

  it('debería delegar en beneficientQueryService y devolver ok con el resultado paginado', async () => {
    const expected = {
      data: [{ id: '1', firstname: 'María' }],
      total: 1,
      page: 1,
      limit: 10,
    };
    beneficientQueryService.searchUnassigned.mockResolvedValue(expected);
    const query = new GetUnassignedBeneficientsQuery(
      'María',
      undefined,
      undefined,
      1,
      10,
    );

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(beneficientQueryService.searchUnassigned).toHaveBeenCalledWith(
      query,
    );
  });
});
