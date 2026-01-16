import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SessionRepository } from '@/auth/domain/repositories/session.repository';
import { SessionModel } from '@/auth/infrastructure/models/session.model';
import { Session } from '@/auth/domain/entities/session.entity';
import { SessionMapper } from '../mappers/session.mapper';
import { BaseRepository } from '@/database/base.repository';

@Injectable()
export class sessionRepositoryAdapter
  extends BaseRepository<SessionModel>
  implements SessionRepository
{
  constructor(datasource: DataSource) {
    super(datasource, SessionModel);
  }

  async findOneBySessionId(sessionId: string): Promise<Session | null> {
    const sessionModel = await this.repository
      .createQueryBuilder('sessions')
      .where('sessions.sessionId = :sessionId', { sessionId })
      .andWhere('sessions.revoked = :revoked', { revoked: false })
      .andWhere('sessions.expiresAt > NOW()')
      .getOne();
    return sessionModel ? SessionMapper.fromModelToDomain(sessionModel) : null;
  }

  async findOneByUserIdAndSessionId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null> {
    const sessionModel = await this.repository
      .createQueryBuilder('sessions')
      .where('sessions.userId = :userId', { userId })
      .andWhere('sessions.sessionId = :sessionId', { sessionId })
      .andWhere('sessions.revoked = :revoked', { revoked: false })
      .andWhere('sessions.expiresAt > NOW()')
      .getOne();
    return sessionModel ? SessionMapper.fromModelToDomain(sessionModel) : null;
  }

  async save(session: Session) {
    return this.repository.save(SessionMapper.toPersistance(session));
  }
}
