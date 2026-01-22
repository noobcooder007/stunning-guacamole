import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ISessionPersistence } from '@/auth/infrastructure/persistence/mappers/session.mapper';
import { UserSchema } from './user.schema';

@Entity('sessions')
export class SessionSchema implements ISessionPersistence {
  @PrimaryColumn('uuid')
  sessionId: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserSchema, (user) => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: UserSchema;

  @Column('text')
  hashedRefreshToken: string;

  @Column('text')
  ip: string;

  @Column('text')
  userAgent: string;

  @Column('timestamp with time zone', {
    nullable: false,
  })
  expiresAt: Date;

  @Column('timestamp with time zone', {
    nullable: false,
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  updatedAt: Date;

  @Column('bool', {
    nullable: false,
  })
  revoked: boolean;
}
