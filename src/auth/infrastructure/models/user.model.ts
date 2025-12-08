import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';

@Entity('users')
export class UserModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @ManyToOne(() => RoleModel, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: RoleModel;

  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  lastLogin: Timestamp;

  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  createdAt: Timestamp;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;
}
