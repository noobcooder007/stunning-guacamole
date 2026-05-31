import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { RoleSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/role.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { IUserPersistence } from '@/auth/infrastructure/persistence/mappers/user.mapper';
import { SessionSchema } from './session.schema';

@Entity('users')
export class UserSchema implements IUserPersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column('uuid', {
    name: 'roleId',
  })
  roleId: string;

  @ManyToOne(() => RoleSchema, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: RoleSchema;

  @Column('timestamp with time zone', {
    default: () => 'NOW()',
  })
  lastLogin: Date;

  @OneToOne(
    () => CollectorSchema,
    (collector) => collector.authenticationAccount,
  )
  collector: CollectorSchema;

  @OneToMany(() => SessionSchema, (session) => session.user)
  sessions: SessionSchema[];

  @Column('timestamp with time zone', {
    nullable: false,
  })
  createdAt: Date;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('enum', { enum: ['MALE', 'FEMALE'], nullable: true })
  gender: string;
}
