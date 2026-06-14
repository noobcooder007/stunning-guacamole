import { CreateCollectorHandler } from './create-collector.handler';
import { CreateCollectorCommand } from '@/community/application/command/create-collector.command';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { ConflictException } from '@/shared/domain/exceptions/conflict-exception.exception';

const USER_ID = '01907c2a-0000-7000-8000-000000000002';

function makeCommand(overrides: Partial<CreateCollectorCommand> = {}): CreateCollectorCommand {
  const cmd = new CreateCollectorCommand(
    'testuser',
    'password123',
    'Juan',
    'Pérez',
    '12345678901',
    'Calle 1',
    '10',
    'CDMX',
    'CDMX',
    '06600',
    '5512345678',
    10,
    500,
    100,
    'BBVA',
    'REF001',
    null,
    '/profiles/pic.jpg',
  );
  return Object.assign(cmd, overrides);
}

describe('CreateCollectorHandler', () => {
  let handler: CreateCollectorHandler;
  let uow: { runInTransaction: jest.Mock };
  let collectorRepository: { exists: jest.Mock; save: jest.Mock };
  let createUserService: { execute: jest.Mock };
  let hasher: { hash: jest.Mock };

  beforeEach(() => {
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    collectorRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };
    createUserService = { execute: jest.fn() };
    hasher = { hash: jest.fn().mockResolvedValue('hashed-value') };

    handler = new CreateCollectorHandler(
      uow as any,
      collectorRepository as any,
      createUserService as any,
      hasher as any,
    );
  });

  it('debería crear y persistir el colector en el caso exitoso', async () => {
    createUserService.execute.mockResolvedValue(Result.ok(USER_ID));

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();
    expect(collectorRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería lanzar ConflictException cuando el usuario ya existe', async () => {
    createUserService.execute.mockResolvedValue(
      Result.fail({
        type: ErrorType.CONFLICT,
        message: 'User already exists',
        entity: 'User',
      }),
    );

    await expect(handler.execute(makeCommand())).rejects.toThrow(ConflictException);
  });

  it('debería lanzar ConflictException cuando el colector ya existe', async () => {
    createUserService.execute.mockResolvedValue(Result.ok(USER_ID));
    collectorRepository.exists.mockResolvedValue(true);

    await expect(handler.execute(makeCommand())).rejects.toThrow(ConflictException);
  });

  it('debería hashear NSS, dirección y teléfono antes de verificar duplicados', async () => {
    createUserService.execute.mockResolvedValue(Result.ok(USER_ID));

    await handler.execute(makeCommand());

    expect(hasher.hash).toHaveBeenCalledTimes(3);
  });

  it('debería hashear también el teléfono opcional cuando se provee', async () => {
    createUserService.execute.mockResolvedValue(Result.ok(USER_ID));
    const cmd = makeCommand({ telephoneNumber: '5598765432' });

    await handler.execute(cmd);

    expect(hasher.hash).toHaveBeenCalledTimes(4);
  });

  it('debería usar los hashes para verificar duplicados en el repositorio', async () => {
    createUserService.execute.mockResolvedValue(Result.ok(USER_ID));

    await handler.execute(makeCommand());

    expect(collectorRepository.exists).toHaveBeenCalledWith(
      expect.objectContaining({
        nssHash: 'hashed-value',
        addressHash: 'hashed-value',
        phoneNumberHash: 'hashed-value',
      }),
    );
  });

  it('debería ejecutar toda la lógica dentro de una transacción', async () => {
    createUserService.execute.mockResolvedValue(Result.ok(USER_ID));

    await handler.execute(makeCommand());

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('no debería guardar el colector si la creación del usuario falla', async () => {
    createUserService.execute.mockResolvedValue(
      Result.fail({
        type: ErrorType.CONFLICT,
        message: 'User already exists',
        entity: 'User',
      }),
    );

    await expect(handler.execute(makeCommand())).rejects.toThrow();
    expect(collectorRepository.save).not.toHaveBeenCalled();
  });
});
