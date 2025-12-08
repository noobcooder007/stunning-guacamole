import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { UserModel } from './user.model';
import { PermitModel } from './permit.model';

@Entity('roles')
export class RoleModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', {
    unique: true,
  })
  name: string;
  @Column('text')
  description: string;
  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  createdAt: Timestamp;
  @Column('bool', {
    default: true,
  })
  isActive: boolean;
  @OneToMany(() => UserModel, (user) => user.role)
  users: UserModel;
  @ManyToMany(() => PermitModel, (permit) => permit.roles)
  @JoinTable({ name: 'role_permitions' })
  permitions: PermitModel[];
}
