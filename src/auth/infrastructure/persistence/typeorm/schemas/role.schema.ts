import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { UserSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/user.schema';
import { PermissionSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/permission.schema';
import { IRolePersistence } from '@/auth/infrastructure/persistence/mappers/role.mapper';

@Entity('roles')
export class RoleSchema implements IRolePersistence {
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
  @OneToMany(() => UserSchema, (user) => user.role)
  users: UserSchema;
  @ManyToMany(() => PermissionSchema, (permission) => permission.roles, {
    cascade: true,
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'role_permissions' })
  permissions: PermissionSchema[];
}
