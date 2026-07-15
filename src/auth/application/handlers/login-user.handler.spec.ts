import { Logger } from '@nestjs/common';
import { LoginUserHandler } from './login-user.handler';
import { LoginUserCommand } from '@/auth/application/commands/login-user.command';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { RoleId } from '@/auth/domain/aggregates/role.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';

beforeAll(() => jest.spyOn(Logger.prototype, 'log').mockImplementation());

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const ROLE_ID = '01907c2a-0000-7000-8000-000000000002';

function makeUser(): User {
  return User.recreate(USER_ID, {
    username: 'testuser',
    password: 'hashed-password',
    roleId: RoleId.of(ROLE_ID),
    isActive: true,
    createdAt: new Date('2026-01-01'),
    lastLogin: null,
  });
}

function makeCommand(
  username = 'testuser',
  password = 'password',
): LoginUserCommand {
  return Object.assign(new LoginUserCommand(username, password), {
    metadata: { ip: '127.0.0.1', userAgent: 'TestAgent/1.0' },
  });
}

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepository: { findOneByUsername: jest.Mock; save: jest.Mock };
  let sessionRepository: { save: jest.Mock };
  let roleRepository: { findById: jest.Mock };
  let permissionRepository: { findByRoleId: jest.Mock };
  let collectorRepository: { findByUserId: jest.Mock };
  let beneficientRepository: { findByUserId: jest.Mock };
  let hasherService: { compare: jest.Mock };
  let hasherTokenService: { hash: jest.Mock };
  let jwtService: {
    createAccessToken: jest.Mock;
    createRefreshToken: jest.Mock;
    ACCESSTOKENVALIDITYMS: number;
    REFRESHTOKENVALIDITYMS: number;
  };

  beforeEach(() => {
    userRepository = {
      findOneByUsername: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    sessionRepository = { save: jest.fn().mockResolvedValue(undefined) };
    roleRepository = {
      findById: jest.fn().mockResolvedValue({ name: 'collector' }),
    };
    permissionRepository = { findByRoleId: jest.fn().mockResolvedValue([]) };
    collectorRepository = { findByUserId: jest.fn().mockResolvedValue(null) };
    beneficientRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
    };
    hasherService = { compare: jest.fn().mockResolvedValue(true) };
    hasherTokenService = {
      hash: jest.fn().mockResolvedValue('hashed-refresh-token'),
    };
    jwtService = {
      createAccessToken: jest.fn().mockReturnValue('access-token'),
      createRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      ACCESSTOKENVALIDITYMS: 900_000,
      REFRESHTOKENVALIDITYMS: 3_600_000,
    };

    handler = new LoginUserHandler(
      userRepository as any,
      sessionRepository as any,
      roleRepository as any,
      permissionRepository as any,
      collectorRepository as any,
      beneficientRepository as any,
      hasherService as any,
      hasherTokenService as any,
      jwtService as any,
    );
  });

  it('debería fallar con UNAUTHORIZED cuando el usuario no existe', async () => {
    userRepository.findOneByUsername.mockResolvedValue(null);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.UNAUTHORIZED);
  });

  it('debería fallar con UNAUTHORIZED cuando la contraseña es incorrecta', async () => {
    userRepository.findOneByUsername.mockResolvedValue(makeUser());
    hasherService.compare.mockResolvedValue(false);

    const result = await handler.execute(
      makeCommand('testuser', 'wrong-password'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.UNAUTHORIZED);
  });

  it('debería devolver AuthResponse con tokens en el caso exitoso', async () => {
    userRepository.findOneByUsername.mockResolvedValue(makeUser());

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.tokens.accessToken).toBe('access-token');
    expect(result.value.tokens.refreshToken).toBe('refresh-token');
    expect(result.value.user.username).toBe('testuser');
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería guardar la sesión y actualizar el lastLogin del usuario', async () => {
    userRepository.findOneByUsername.mockResolvedValue(makeUser());

    await handler.execute(makeCommand());

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(hasherTokenService.hash).toHaveBeenCalledWith('refresh-token');
  });

  it('no debería incluir collectorId/beneficientId cuando el usuario no está vinculado', async () => {
    userRepository.findOneByUsername.mockResolvedValue(makeUser());

    await handler.execute(makeCommand());

    expect(jwtService.createAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ collectorId: undefined, beneficientId: undefined }),
    );
  });

  it('debería incluir collectorId en el token cuando el usuario está vinculado a un Collector', async () => {
    userRepository.findOneByUsername.mockResolvedValue(makeUser());
    collectorRepository.findByUserId.mockResolvedValue({
      _id: { unpack: () => 'collector-id-1' },
    });

    await handler.execute(makeCommand());

    expect(jwtService.createAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ collectorId: 'collector-id-1' }),
    );
  });

  it('debería incluir beneficientId en el token cuando el usuario está vinculado a un Beneficient', async () => {
    userRepository.findOneByUsername.mockResolvedValue(makeUser());
    beneficientRepository.findByUserId.mockResolvedValue({
      _id: { unpack: () => 'beneficient-id-1' },
    });

    await handler.execute(makeCommand());

    expect(jwtService.createAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ beneficientId: 'beneficient-id-1' }),
    );
  });
});
