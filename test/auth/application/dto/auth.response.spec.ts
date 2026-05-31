import 'reflect-metadata';
import { AuthResponse, SessionDto, UserDto } from '@/auth/application/dto/auth.response';
import { instanceToPlain, plainToInstance } from 'class-transformer';

describe('AuthResponse', () => {
  it('should create an instance', () => {
    const authResponse = new AuthResponse();
    expect(authResponse).toBeInstanceOf(AuthResponse);
  });

  it('should transform nested objects into instances of UserDto and SessionDto', () => {
    const plain = {
      user: { username: 'testuser', role: 'testrole' },
      tokens: {
        accessToken: 'testtoken',
        expiresIn: 3600,
        refreshToken: 'testrefreshtoken',
        refreshExpiresIn: 86400,
        sessionId: 'testsessionid',
      },
    };
    const authResponse = plainToInstance(AuthResponse, plain);

    expect(authResponse.user).toBeInstanceOf(UserDto);
    expect(authResponse.tokens).toBeInstanceOf(SessionDto);
  });

  it('should NOT include refreshToken in the final JSON response', () => {
    const session = new SessionDto();
    session.refreshToken = 'secret_token_123';

    const authResponse = new AuthResponse();
    authResponse.tokens = session;

    const plain = instanceToPlain(authResponse);

    // El campo debe ser eliminado por el decorador @Exclude()
    expect(plain.tokens.refreshToken).toBeUndefined();
  });

  it('should tokens params types be correct', () => {
    const plain = {
      user: { username: 'testuser', role: 'testrole' },
      tokens: {
        accessToken: 'testtoken',
        expiresIn: 3600,
        refreshToken: 'testrefreshtoken',
        refreshExpiresIn: 86400,
        sessionId: 'testsessionid',
      },
    };
    const authResponse = plainToInstance(AuthResponse, plain);

    expect(typeof authResponse.tokens.accessToken).toBe('string');
    expect(typeof authResponse.tokens.expiresIn).toBe('number');
    expect(typeof authResponse.tokens.refreshExpiresIn).toBe('number');
    expect(typeof authResponse.tokens.sessionId).toBe('string');
  });

  it('should include all exposed fields in the output', () => {
    const authResponse = new AuthResponse();
    authResponse.user = Object.assign(new UserDto(), {
      username: 'dev',
      role: 'user',
    });

    const plain = instanceToPlain(authResponse);

    expect(plain.user).toHaveProperty('username');
    expect(plain.user).toHaveProperty('role');
  });

  it('should maintain data integrity for session tokens', () => {
    const tokens = {
      accessToken: 'access',
      expiresIn: 3600,
      refreshExpiresIn: 86400,
      sessionId: 'session-id',
    };

    const instance = plainToInstance(SessionDto, tokens);

    expect(typeof instance.accessToken).toBe('string');
    expect(typeof instance.expiresIn).toBe('number');
    expect(instance.expiresIn).toBe(3600);
  });
});
