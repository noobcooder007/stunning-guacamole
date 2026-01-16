import { Injectable } from '@nestjs/common';
import { Session } from '@/auth/domain/entities/session.entity';

@Injectable()
export abstract class SessionRepository {
  abstract findOneBySessionId(sessionId: string): Promise<Session | null>;
  abstract findOneByUserIdAndSessionId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null>;
  abstract save(session: Session);
}
