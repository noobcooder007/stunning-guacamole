import { Session, SessionId } from '@/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { SessionMetadata } from '@/auth/domain/value-objects/session-metadata.vo';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export interface ISessionPersistence {
  sessionId: string;
  userId: string;
  hashedRefreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ip: string;
  userAgent: string;
  revoked: boolean;
}

export class SessionMapper {
  public static toPersistance(session: Session): ISessionPersistence {
    return {
      userId: session.userId.unpack(),
      hashedRefreshToken: session.hashRefreshToken.unpack(),
      sessionId: session.sessionId.unpack(),
      expiresAt: session.expiresAt.unpack(),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      ip: session.sessionMetadata.unpack().ip,
      userAgent: session.sessionMetadata.unpack().userAgent,
      revoked: session.revoked,
    };
  }

  public static fromModelToDomain(raw: ISessionPersistence): Session {
    if (!raw) return null;
    return Session.recreate({
      sessionId: SessionId.of(raw.sessionId),
      userId: UserId.of(raw.userId),
      hashRefreshToken: RefreshTokenHash.of(raw.hashedRefreshToken),
      expiresAt: ExpiresAtDate.of(raw.expiresAt),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      sessionMetadata: SessionMetadata.of({
        ip: raw.ip,
        userAgent: raw.userAgent,
      }),
      revoked: raw.revoked,
    });
  }
}
