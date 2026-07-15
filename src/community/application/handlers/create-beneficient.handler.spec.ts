import { CreateBeneficientHandler } from './create-beneficient.handler';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';

const CHURCH_ID = '01907c2a-0000-7000-8000-000000000001';
const NEW_USER_ID = '01907c2a-0000-7000-8000-000000000009';

function makeCommand(
  withTax = false,
  username?: string,
  password?: string,
): CreateBeneficientCommand {
  return new CreateBeneficientCommand(
    'Sr.',
    'Juan',
    'Pérez',
    null,
    new Date('1985-01-01'),
    'MALE',
    'Soltero',
    'Calle 1',
    '10',
    null,
    'Centro',
    null,
    'CDMX',
    'CDMX',
    '06600',
    CHURCH_ID,
    false,
    undefined,
    withTax ? 'FÍSICA' : undefined,
    withTax ? 'Juan Pérez García' : undefined,
    withTax ? 'XAXX010101000' : undefined,
    'test@example.com',
    '5512345678',
    username,
    password,
  );
}

function makeUow() {
  return {
    runInTransaction: jest
      .fn()
      .mockImplementation((fn: () => Promise<any>) => fn()),
  };
}

describe('CreateBeneficientHandler', () => {
  let handler: CreateBeneficientHandler;
  let uow: { runInTransaction: jest.Mock };
  let beneficientRepository: { exists: jest.Mock; save: jest.Mock };
  let churchRepository: { findById: jest.Mock };
  let profileRepository: { exists: jest.Mock; save: jest.Mock };
  let hasher: { hash: jest.Mock };
  let createUserService: { execute: jest.Mock };

  beforeEach(() => {
    uow = makeUow();
    beneficientRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };
    churchRepository = { findById: jest.fn() };
    profileRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };
    hasher = { hash: jest.fn().mockResolvedValue('hashed') };
    createUserService = {
      execute: jest.fn().mockResolvedValue(Result.ok(NEW_USER_ID)),
    };

    handler = new CreateBeneficientHandler(
      uow as any,
      beneficientRepository as any,
      churchRepository as any,
      profileRepository as any,
      hasher as any,
      createUserService as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando la iglesia no existe', async () => {
    churchRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(beneficientRepository.save).not.toHaveBeenCalled();
    expect(profileRepository.save).not.toHaveBeenCalled();
  });

  it('debería fallar con CONFLICT cuando ya existe un perfil con la misma identidad', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });
    profileRepository.exists.mockResolvedValue(true);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
    expect(beneficientRepository.save).not.toHaveBeenCalled();
  });

  it('debería fallar con CONFLICT cuando el bienhechor ya existe (email/rfc)', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });
    beneficientRepository.exists.mockResolvedValue(true);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
    expect(beneficientRepository.save).not.toHaveBeenCalled();
  });

  it('debería crear y guardar el perfil y el bienhechor en el caso exitoso', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();
    expect(profileRepository.save).toHaveBeenCalledTimes(1);
    expect(beneficientRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería crear el bienhechor con información fiscal cuando se provee', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    const result = await handler.execute(makeCommand(true));

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledTimes(4);
  });

  it('debería hashear dirección, email, RFC y teléfono cuando se proveen', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    await handler.execute(makeCommand(true));

    expect(hasher.hash).toHaveBeenCalledTimes(4);
  });

  it('no debería hashear email, RFC ni teléfono cuando no se proveen', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });
    const command = new CreateBeneficientCommand(
      'Sr.',
      'Juan',
      'Pérez',
      null,
      new Date('1985-01-01'),
      'MALE',
      'Soltero',
      'Calle 1',
      '10',
      null,
      'Centro',
      null,
      'CDMX',
      'CDMX',
      '06600',
      CHURCH_ID,
      false,
    );

    await handler.execute(command);

    // Solo la dirección se hashea siempre; email, rfc y teléfono son opcionales.
    expect(hasher.hash).toHaveBeenCalledTimes(1);
  });

  it('debería ejecutar toda la lógica dentro de una transacción', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    await handler.execute(makeCommand());

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
  });

  describe('cuenta de acceso opcional', () => {
    it('no debería crear un usuario cuando no se proveen username/password', async () => {
      churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

      await handler.execute(makeCommand());

      expect(createUserService.execute).not.toHaveBeenCalled();
    });

    it('debería crear un usuario con rol beneficient y vincularlo cuando se proveen username/password', async () => {
      churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

      const result = await handler.execute(
        makeCommand(false, 'juanp', 'password123'),
      );

      expect(result.isSuccess).toBe(true);
      expect(createUserService.execute).toHaveBeenCalledWith({
        username: 'juanp',
        password: 'password123',
        role: 'beneficient',
      });
      expect(beneficientRepository.save).toHaveBeenCalledTimes(1);
    });

    it('debería fallar con VALIDATION si solo se provee username', async () => {
      const result = await handler.execute(
        makeCommand(false, 'juanp', undefined),
      );

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.VALIDATION);
      expect(uow.runInTransaction).not.toHaveBeenCalled();
    });

    it('debería fallar con VALIDATION si solo se provee password', async () => {
      const result = await handler.execute(
        makeCommand(false, undefined, 'password123'),
      );

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.VALIDATION);
      expect(uow.runInTransaction).not.toHaveBeenCalled();
    });

    it('debería propagar el error si CreateUserService falla (ej. username duplicado)', async () => {
      churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });
      createUserService.execute.mockResolvedValue(
        Result.fail({
          type: ErrorType.CONFLICT,
          message: 'User already exists',
          entity: 'User',
        }),
      );

      const result = await handler.execute(
        makeCommand(false, 'juanp', 'password123'),
      );

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.CONFLICT);
      expect(beneficientRepository.save).not.toHaveBeenCalled();
    });
  });
});
