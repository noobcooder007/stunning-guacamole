import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserModel } from './user.model';
import { PermissionModel } from './permission.model';

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
  @Column('timestamp with time zone', {
    nullable: false,
  })
  createdAt: Date;
  @Column('bool', {
    default: true,
  })
  isActive: boolean;
  @OneToMany(() => UserModel, (user) => user.role)
  users: UserModel;
  @ManyToMany(() => PermissionModel, (permit) => permit.roles)
  @JoinTable({ name: 'role_permissions' })
  permissions: PermissionModel[];
}
