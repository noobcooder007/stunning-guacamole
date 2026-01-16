import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';

@Entity('permissions')
export class PermissionModel {
  @PrimaryColumn('uuid')
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
  @ManyToMany(() => RoleModel, (role) => role.permissions)
  roles: RoleModel[];
}
