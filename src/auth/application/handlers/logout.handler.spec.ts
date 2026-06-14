import { LogoutHandler } from './logout.handler';
import { LogoutCommand } from '@/auth/application/commands/logout.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const SESSION_ID = '01907c2a-0000-7000-8000-000000000001';

function makeCommand(withToken = true) {
  return Object.assign(new LogoutCommand(SESSION_ID), {
    metadata: withToken
      ? { refreshToken: 'raw-refresh-token', userAgent: 'TestAgent/1.0' }
      : { refreshToken: null, userAgent: 'TestAgent/1.0' },
  });
}

function makeSession() {
  return {
    validateToken: jest.fn().mockResolvedValue(true),
    revokeSession: jest.fn(),
  };
}

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
  let sessionRepository: { findOneBySessionId: jest.Mock; save: jest.Mock };
  let hasherService: { safeCompare: jest.Mock; hash: jest.Mock };

  beforeEach(() => {
    sessionRepository = {
      findOneBySessionId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    hasherService = {
      safeCompare: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('hash'),
    };
    handler = new LogoutHandler(sessionRepository as any, hasherService as any);
  });

  it('debería fallar con UNAUTHORIZED cuando no hay refreshToken en el contexto', async () => {
    const result = await handler.execute(makeCommand(false));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.UNAUTHORIZED);
    expect(sessionRepository.findOneBySessionId).not.toHaveBeenCalled();
  });

  it('debería fallar con UNAUTHORIZED cuando la sesión no existe', async () => {
    sessionRepository.findOneBySessionId.mockResolvedValue(null);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.UNAUTHORIZED);
  });

  it('debería revocar la sesión y retornar ok en el caso exitoso', async () => {
    const session = makeSession();
    sessionRepository.findOneBySessionId.mockResolvedValue(session);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(session.revokeSession).toHaveBeenCalled();
    expect(sessionRepository.save).toHaveBeenCalledWith(session);
  });
});
