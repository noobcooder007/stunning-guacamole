import { GetBeneficientsRegistryHandler } from './get-beneficients-registry.handler';
import { GetBeneficientsRegistryQuery } from '@/community/application/query/get-beneficients-registry.query';

describe('GetBeneficientsRegistryHandler', () => {
  let handler: GetBeneficientsRegistryHandler;
  let registryService: { getRegistry: jest.Mock };

  beforeEach(() => {
    registryService = { getRegistry: jest.fn() };
    handler = new GetBeneficientsRegistryHandler({} as any, registryService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 20 };
    registryService.getRegistry.mockResolvedValue(expected);
    const query = new GetBeneficientsRegistryQuery(1, 20);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(registryService.getRegistry).toHaveBeenCalledWith(1, 20);
  });
});
