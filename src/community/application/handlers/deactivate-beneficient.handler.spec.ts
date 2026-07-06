import { DeactivateBeneficientHanlder } from './deactivate-beneficient.handler';
import { DeactivateBeneficientCommand } from '@/community/application/command/deactivate-beneficient.command';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
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
    maritalStatus: 'SINGLE',
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
  });
}

describe('DeactivateBeneficientHandler', () => {
  let handler: DeactivateBeneficientHanlder;
  let beneficientRepository: { findById: jest.Mock; save: jest.Mock };
  let publisher: { mergeObjectContext: jest.Mock };

  const command = new DeactivateBeneficientCommand(BID, 'Baja voluntaria');

  beforeEach(() => {
    beneficientRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    publisher = {
      mergeObjectContext: jest.fn().mockReturnValue({ commit: jest.fn() }),
    };
    handler = new DeactivateBeneficientHanlder(
      beneficientRepository as any,
      publisher as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando el beneficiario no existe', async () => {
    beneficientRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería desactivar y guardar al beneficiario', async () => {
    const b = makeBeneficient();
    beneficientRepository.findById.mockResolvedValue(b);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(b.isActive).toBe(false);
    expect(b.reasonDeactivated).toBe('Baja voluntaria');
    expect(beneficientRepository.save).toHaveBeenCalledWith(b);
  });

  it('debería hacer commit al publicar el evento', async () => {
    beneficientRepository.findById.mockResolvedValue(makeBeneficient());
    const mockPublisher = { commit: jest.fn() };
    publisher.mergeObjectContext.mockReturnValue(mockPublisher);

    await handler.execute(command);

    expect(mockPublisher.commit).toHaveBeenCalledTimes(1);
  });
});
