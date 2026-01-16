import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';
import { ParticipantModel } from '@/people/infrastructure/models/participants.model';

@Entity('users')
export class UserModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @ManyToOne(() => RoleModel, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: RoleModel;

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
