import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { RoleSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/role.schema';
import { ParticipantModel } from '@/people/infrastructure/models/participants.model';
import { IUserPersistence } from '@/auth/infrastructure/persistence/mappers/user.mapper';

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
    () => ParticipantModel,
    (participant) => participant.authenticationAccount,
  )
  participant: ParticipantModel;

  @Column('timestamp with time zone', {
    nullable: false,
  })
  createdAt: Date;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;
}
