import { CreateChurchHandler } from './create-church.handler';
import { CreateChurchCommand } from '../command/create-church.command';
import { ConflictException } from '@/shared/domain/exceptions/conflict-exception.exception';

function makeCommand(): CreateChurchCommand {
  return {
    ecclesialIdentity: {
      name: 'Parroquia San Pedro',
      vicaria: 'Vicaria Norte',
      decanato: 'Decanato 1',
      parroquia: 'San Pedro Apóstol',
      capilla: 'Capilla Central',
    },
    address: {
      street: 'Calle Principal',
      numeration: { noExt: '10', noInt: null },
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: '06600',
    },
    priest: {
      firstname: 'Pedro',
      firstLastname: 'García',
      secondLastname: null,
    },
    auxiliarPriest: {
      firstname: 'Juan',
      firstLastname: 'López',
      secondLastname: null,
    },
    phoneNumber: '5512345678',
  } as CreateChurchCommand;
}

describe('CreateChurchHandler', () => {
  let handler: CreateChurchHandler;
  let churchRepository: { exists: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    churchRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreateChurchHandler(churchRepository as any);
  });

  it('debería lanzar ConflictException cuando la iglesia ya existe', async () => {
    churchRepository.exists.mockResolvedValue(true);

    await expect(handler.execute(makeCommand())).rejects.toThrow(
      ConflictException,
    );
    expect(churchRepository.save).not.toHaveBeenCalled();
  });

  it('debería crear y guardar la iglesia en el caso exitoso', async () => {
    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();
    expect(churchRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería verificar existencia antes de crear', async () => {
    await handler.execute(makeCommand());

    expect(churchRepository.exists).toHaveBeenCalledTimes(1);
  });
});
