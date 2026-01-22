import { Injectable } from '@nestjs/common';
import { Session } from '@/auth/domain/aggregates/session.aggregate';

@Injectable()
export abstract class ISessionRepository {
  abstract findOneBySessionId(sessionId: string): Promise<Session | null>;
  abstract findOneByUserIdAndSessionId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null>;
  abstract save(session: Session);
}
