import { GetBeneficientByIdHandler } from './get-beneficient-by-id.handler';
import { GetBeneficientByIdQuery } from '@/community/application/query/get-beneficient-by-id.query';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { Address, Numeration } from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const BID = '01907c2a-0000-7000-8000-000000000001';
const CID = '01907c2a-0000-7000-8000-000000000002';

function makeBeneficient(): Beneficient {
  return Beneficient.recreate(BID, {
    title: 'Sr.',
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: null,
    birthday: new Date('1985-01-01'),
    genre: 'MALE',
    maritalStatus: 'Soltero',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'h',
    church: ChurchId.of(CID),
    keepPrivate: false,
    isActive: true,
    beneficientNumber: 5,
  });
}

describe('GetBeneficientByIdHandler', () => {
  let handler: GetBeneficientByIdHandler;
  let beneficientRepository: { findById: jest.Mock };
  const datasource = {} as any;
  const query = new GetBeneficientByIdQuery(BID);

  beforeEach(() => {
    beneficientRepository = { findById: jest.fn() };
    handler = new GetBeneficientByIdHandler(datasource, beneficientRepository as any);
  });

  it('debería fallar con NOT_FOUND cuando el beneficiario no existe', async () => {
    beneficientRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería retornar el beneficiario mapeado en el caso exitoso', async () => {
    const beneficient = makeBeneficient();
    beneficientRepository.findById.mockResolvedValue(beneficient);
    jest.spyOn(BeneficientMapper, 'fromDomainToResponse').mockReturnValue({
      firstname: 'Juan',
      firstLastname: 'Pérez',
    } as any);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.firstname).toBe('Juan');
    expect(BeneficientMapper.fromDomainToResponse).toHaveBeenCalledWith(beneficient);
  });

  it('debería buscar por el id de la query', async () => {
    beneficientRepository.findById.mockResolvedValue(null);

    await handler.execute(query);

    expect(beneficientRepository.findById).toHaveBeenCalledWith(BID);
  });
});
