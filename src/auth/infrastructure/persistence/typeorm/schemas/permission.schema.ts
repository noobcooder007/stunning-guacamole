import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { RoleSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/role.schema';
import { IPermissionPersistence } from '@/auth/infrastructure/persistence/mappers/permission.mapper';

@Entity('permissions')
export class PermissionSchema implements IPermissionPersistence {
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
  @ManyToMany(() => RoleSchema, (role) => role.permissions)
  roles: RoleSchema[];
}
