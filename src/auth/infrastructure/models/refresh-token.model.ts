import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenModel {
  @PrimaryColumn('uuid')
  userId: string;
  @Column('text')
  hashedRefreshToken: string;
  @Column('timestamp without time zone')
  expiresAt: string;
  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  createdAt: string;
}
