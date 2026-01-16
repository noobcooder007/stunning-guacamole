import { Session } from '@/auth/domain/entities/session.entity';

export class SessionMapper {
  public static toPersistance(session: Session): any {
    return {
      userId: session.userId,
      hashedRefreshToken: session.hashRefreshToken,
      sessionId: session.sessionId.toString(),
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      ip: session.ip,
      userAgent: session.userAgent,
      revoked: session.revoked,
    };
  }

  public static fromModelToDomain(raw: any): Session {
    if (!raw) return null;
    return Session.recreate({
      userId: raw.userId,
      hashRefreshToken: raw.hashedRefreshToken,
      sessionId: raw.sessionId,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      ip: raw.ip,
      userAgent: raw.userAgent,
      revoked: raw.revoked,
    });
  }
}
