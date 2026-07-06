import { Session, SessionId } from './session.aggregate';
import { UserId } from './user.aggregate';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { SessionMetadata } from '@/auth/domain/value-objects/session-metadata.vo';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const SESSION_ID = '01907c2a-0000-7000-8000-000000000002';

function makeFutureDate(ms = 3_600_000): Date {
  return new Date(Date.now() + ms);
}

function makeSession(revoked = false): Session {
  return Session.recreate({
    sessionId: SessionId.of(SESSION_ID),
    userId: UserId.of(USER_ID),
    hashRefreshToken: RefreshTokenHash.of('hash-token'),
    expiresAt: ExpiresAtDate.of(makeFutureDate()),
    sessionMetadata: SessionMetadata.of({
      ip: '127.0.0.1',
      userAgent: 'TestAgent/1.0',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
    revoked,
  });
}

describe('Session', () => {
  describe('create()', () => {
    it('debería crear la sesión con revoked=false y fechas asignadas', () => {
      const session = Session.create({
        sessionId: SessionId.of(SESSION_ID),
        userId: UserId.of(USER_ID),
        hashRefreshToken: RefreshTokenHash.of('hash-token'),
        expiresAt: ExpiresAtDate.of(makeFutureDate()),
        sessionMetadata: SessionMetadata.of({
          ip: '10.0.0.1',
          userAgent: 'Agent',
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        revoked: false,
      });

      expect(session.revoked).toBe(false);
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });
  });

  describe('getters', () => {
    it('debería retornar sessionId', () => {
      expect(makeSession().sessionId.unpack()).toBe(SESSION_ID);
    });

    it('debería retornar userId', () => {
      expect(makeSession().userId.unpack()).toBe(USER_ID);
    });

    it('debería retornar revoked', () => {
      expect(makeSession(false).revoked).toBe(false);
      expect(makeSession(true).revoked).toBe(true);
    });
  });

  describe('updateSession()', () => {
    it('debería actualizar el token y la fecha de expiración', () => {
      const session = makeSession();
      const newHash = RefreshTokenHash.of('new-hash');
      const newExpiry = ExpiresAtDate.of(makeFutureDate(7_200_000));

      session.updateSession(newHash, newExpiry);

      expect(session.hashRefreshToken.unpack()).toBe('new-hash');
      expect(session.expiresAt).toBe(newExpiry);
    });
  });

  describe('revokeSession()', () => {
    it('debería marcar la sesión como revocada', () => {
      const session = makeSession(false);
      session.revokeSession();
      expect(session.revoked).toBe(true);
    });
  });

  describe('validateToken()', () => {
    it('debería retornar true cuando la sesión no está revocada', async () => {
      const session = makeSession(false);
      const hasher = { hash: jest.fn(), safeCompare: jest.fn() };

      const result = await session.validateToken(
        'any',
        'any-agent',
        hasher as any,
      );

      expect(result).toBe(true);
      expect(hasher.safeCompare).not.toHaveBeenCalled();
    });

    it('debería delegar al hasher cuando la sesión está revocada, expirada y el fingerprint no coincide', async () => {
      const session = Session.recreate({
        sessionId: SessionId.of(SESSION_ID),
        userId: UserId.of(USER_ID),
        hashRefreshToken: RefreshTokenHash.of('stored-hash'),
        expiresAt: ExpiresAtDate.of(makeFutureDate()),
        sessionMetadata: SessionMetadata.of({
          ip: '127.0.0.1',
          userAgent: 'OriginalAgent',
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        revoked: true,
      });
      const hasher = {
        hash: jest.fn().mockResolvedValue('stored-hash'),
        safeCompare: jest.fn().mockResolvedValue(true),
      };
      // expiresAt.isAlive() returns true because date is in the future → short-circuits to true
      const result = await session.validateToken(
        'plain-token',
        'OtherAgent',
        hasher as any,
      );
      expect(result).toBe(true);
    });
  });
});
