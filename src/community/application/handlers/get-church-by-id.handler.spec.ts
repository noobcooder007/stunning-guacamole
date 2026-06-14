import { GetChurchByIdHandler } from './get-church-by-id.handler';
import { GetChurchByIdQuery } from '@/community/application/query/get-church-by-id.query';
import { ChurchMapper } from '@/community/infrastructure/persistence/mappers/church.mapper';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const CHURCH_ID = '01907c2a-0000-7000-8000-000000000001';

describe('GetChurchByIdHandler', () => {
  let handler: GetChurchByIdHandler;
  let churchRepository: { findById: jest.Mock };
  const query = new GetChurchByIdQuery(CHURCH_ID);

  beforeEach(() => {
    churchRepository = { findById: jest.fn() };
    handler = new GetChurchByIdHandler({} as any, churchRepository as any);
    jest.restoreAllMocks();
  });

  it('debería fallar con NOT_FOUND cuando la iglesia no existe', async () => {
    churchRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería devolver la iglesia mapeada cuando existe', async () => {
    const mockChurch = {};
    churchRepository.findById.mockResolvedValue(mockChurch);
    jest.spyOn(ChurchMapper, 'fromDomainToResponse').mockReturnValue({
      id: CHURCH_ID,
      name: 'San Pedro',
    } as any);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(CHURCH_ID);
    expect(ChurchMapper.fromDomainToResponse).toHaveBeenCalledWith(mockChurch);
  });
});
