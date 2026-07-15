import { CreateUserService } from './create-user.service';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const ROLE_ID = '01907c2a-0000-7000-8000-000000000010';

function makeRole(name: string) {
  return {
    _id: { unpack: () => ROLE_ID },
    name,
  };
}

describe('CreateUserService', () => {
  let userRepository: {
    findOneByUsername: jest.Mock;
    countActiveUsersByRole: jest.Mock;
    save: jest.Mock;
  };
  let roleRepository: { findByName: jest.Mock };
  let passwordHasher: { hash: jest.Mock };
  let service: CreateUserService;

  beforeEach(() => {
    userRepository = {
      findOneByUsername: jest.fn().mockResolvedValue(null),
      countActiveUsersByRole: jest.fn().mockResolvedValue(0),
      save: jest.fn().mockResolvedValue('new-user-id'),
    };
    roleRepository = { findByName: jest.fn() };
    passwordHasher = { hash: jest.fn().mockResolvedValue('hashed') };

    service = new CreateUserService(
      userRepository as any,
      roleRepository as any,
      passwordHasher as any,
    );
  });

  it('debería crear el primer usuario superadministrator', async () => {
    roleRepository.findByName.mockResolvedValue(makeRole('superadministrator'));

    const result = await service.execute(
      new CreateUserCommand('admin', 'password123', 'superadministrator'),
    );

    expect(result.isSuccess).toBe(true);
    expect(userRepository.countActiveUsersByRole).toHaveBeenCalledWith(
      ROLE_ID,
    );
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería rechazar con CONFLICT un segundo superadministrator activo', async () => {
    roleRepository.findByName.mockResolvedValue(makeRole('superadministrator'));
    userRepository.countActiveUsersByRole.mockResolvedValue(1);

    const result = await service.execute(
      new CreateUserCommand('admin2', 'password123', 'superadministrator'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('debería permitir crear superadministrator si el único existente está inactivo', async () => {
    roleRepository.findByName.mockResolvedValue(makeRole('superadministrator'));
    userRepository.countActiveUsersByRole.mockResolvedValue(0);

    const result = await service.execute(
      new CreateUserCommand('admin', 'password123', 'superadministrator'),
    );

    expect(result.isSuccess).toBe(true);
  });

  it('no debería verificar unicidad para roles distintos de superadministrator', async () => {
    roleRepository.findByName.mockResolvedValue(makeRole('collector'));

    const result = await service.execute(
      new CreateUserCommand('collector1', 'password123', 'collector'),
    );

    expect(result.isSuccess).toBe(true);
    expect(userRepository.countActiveUsersByRole).not.toHaveBeenCalled();
  });

  it('debería fallar con CONFLICT si el username ya existe', async () => {
    userRepository.findOneByUsername.mockResolvedValue({ id: 'existing' });
    roleRepository.findByName.mockResolvedValue(makeRole('collector'));

    const result = await service.execute(
      new CreateUserCommand('existing', 'password123', 'collector'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería fallar con NOT_FOUND si el rol no existe', async () => {
    roleRepository.findByName.mockResolvedValue(null);

    const result = await service.execute(
      new CreateUserCommand('someone', 'password123', 'ghost-role'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });
});
