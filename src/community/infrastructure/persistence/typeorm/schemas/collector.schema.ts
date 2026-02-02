import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { UserSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/user.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ICollectorPersistence } from '../../mappers/collector.mapper';

@Entity('collector')
@Unique(['firstname', 'firstLastname', 'secondLastname'])
@Unique(['street', 'noExt', 'city', 'state', 'zipCode'])
export class CollectorSchema implements ICollectorPersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @OneToOne(() => UserSchema, (user) => user.collector, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'userId' })
  authenticationAccount: UserSchema;

  @Column('text')
  firstname: string;

  @Column('text')
  firstLastname: string;

  @Column('text', {
    nullable: true,
  })
  secondLastname: string;

  @Column('text', {
    unique: true,
  })
  nss: string;

  @Column('text')
  street: string;

  @Column('text')
  noExt: string;

  @Column('text', {
    nullable: true,
  })
  noInt: string;

  @Column('text', {
    nullable: true,
  })
  neighborhood: string;

  @Column('text')
  city: string;

  @Column('text')
  state: string;
  @Column('text')
  zipCode: string;

  @Column('text', {
    nullable: true,
  })
  locality: string;

  @Column('text', {
    unique: true,
  })
  phoneNumber: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  telephoneNumber: string;

  @Column('int')
  commissionPercent: number;

  @Column('text')
  bank: string;

  @Column('text')
  reference: string;

  @Column('text', {
    nullable: true,
  })
  notes: string;

  @OneToMany(() => AssignationSchema, (assignation) => assignation.collector, {
    lazy: false,
  })
  assignations: AssignationSchema[];

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('timestamp with time zone')
  createdAt: Date;
}
