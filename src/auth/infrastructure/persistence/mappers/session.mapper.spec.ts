import { SessionMapper, ISessionPersistence } from './session.mapper';
import { Session, SessionId } from '@/auth/domain/aggregates/session.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { SessionMetadata } from '@/auth/domain/value-objects/session-metadata.vo';

const SESSION_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';

function makeFutureDate(): Date {
  return new Date(Date.now() + 3_600_000);
}

function makeDomainSession(): Session {
  return Session.recreate({
    sessionId: SessionId.of(SESSION_ID),
    userId: UserId.of(USER_ID),
    hashRefreshToken: RefreshTokenHash.of('hash-token'),
    expiresAt: ExpiresAtDate.of(makeFutureDate()),
    sessionMetadata: SessionMetadata.of({
      ip: '127.0.0.1',
      userAgent: 'TestAgent/1.0',
    }),
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
    revoked: false,
  });
}

const validRaw: ISessionPersistence = {
  sessionId: SESSION_ID,
  userId: USER_ID,
  hashedRefreshToken: 'hash-token',
  expiresAt: makeFutureDate(),
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
  ip: '127.0.0.1',
  userAgent: 'TestAgent/1.0',
  revoked: false,
};

describe('SessionMapper', () => {
  describe('toPersistance()', () => {
    it('debería mapear la sesión al objeto de persistencia', () => {
      const raw = SessionMapper.toPersistance(makeDomainSession());

      expect(raw.sessionId).toBe(SESSION_ID);
      expect(raw.userId).toBe(USER_ID);
      expect(raw.hashedRefreshToken).toBe('hash-token');
      expect(raw.ip).toBe('127.0.0.1');
      expect(raw.userAgent).toBe('TestAgent/1.0');
      expect(raw.revoked).toBe(false);
    });
  });

  describe('fromModelToDomain()', () => {
    it('debería reconstruir la sesión desde persistencia', () => {
      const session = SessionMapper.fromModelToDomain(validRaw);

      expect(session.sessionId.unpack()).toBe(SESSION_ID);
      expect(session.userId.unpack()).toBe(USER_ID);
      expect(session.hashRefreshToken.unpack()).toBe('hash-token');
      expect(session.revoked).toBe(false);
    });

    it('debería retornar null cuando el raw es null', () => {
      expect(SessionMapper.fromModelToDomain(null)).toBeNull();
    });
  });
});
