import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenModel {
  @PrimaryColumn('uuid')
  sessionId: string;
  @Column('uuid')
  userId: string;
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
}
