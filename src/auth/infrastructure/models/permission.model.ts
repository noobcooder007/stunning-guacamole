import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';

@Entity('permissions')
export class PermissionModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text')
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
  @ManyToMany(() => RoleModel, (role) => role.permissions)
  roles: RoleModel[];
}
