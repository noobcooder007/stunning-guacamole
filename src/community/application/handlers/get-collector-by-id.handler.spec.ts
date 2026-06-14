import { GetCollectorByIdHandler } from './get-collector-by-id.handler';
import { GetCollectorByIdQuery } from '@/community/application/query/get-collector-by-id.query';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';

describe('GetCollectorByIdHandler', () => {
  let handler: GetCollectorByIdHandler;
  let collectorRepository: { findById: jest.Mock };
  const query = new GetCollectorByIdQuery(COLLECTOR_ID);

  beforeEach(() => {
    collectorRepository = { findById: jest.fn() };
    handler = new GetCollectorByIdHandler({} as any, collectorRepository as any);
    jest.restoreAllMocks();
  });

  it('debería fallar con NOT_FOUND cuando el colector no existe', async () => {
    collectorRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería devolver el colector mapeado cuando existe', async () => {
    const mockCollector = {};
    collectorRepository.findById.mockResolvedValue(mockCollector);
    jest.spyOn(CollectorMapper, 'fromDomainToResponse').mockReturnValue({ id: COLLECTOR_ID } as any);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(COLLECTOR_ID);
    expect(CollectorMapper.fromDomainToResponse).toHaveBeenCalledWith(mockCollector);
  });
});
