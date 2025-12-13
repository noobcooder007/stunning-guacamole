import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @Column('timestamp with time zone', {
    default: () => 'NOW()',
  })
  lastLogin: Date;

  @Column('timestamp with time zone', {
    nullable: false,
  })
  createdAt: Date;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;
}
