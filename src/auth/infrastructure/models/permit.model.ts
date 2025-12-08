import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { RoleModel } from './rol.model';

@Entity('permitions')
export class PermitModel {
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
  @ManyToMany(() => RoleModel, (role) => role.permitions)
  roles: RoleModel[];
}
