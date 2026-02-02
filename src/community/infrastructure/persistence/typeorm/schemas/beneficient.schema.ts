import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { IBeneficientPersistence } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';

@Entity('beneficient')
@Unique(['firstname', 'firstLastname', 'secondLastname'])
@Unique(['street', 'noExt', 'city', 'state', 'zipCode'])
export class BeneficientSchema implements IBeneficientPersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Column('enum', {
    enum: ['Sr', 'Sra', 'Srta', 'Srto'],
    nullable: true,
  })
  title: string;

  @Column('text')
  firstname: string;

  @Column('text')
  firstLastname: string;

  @Column('text', {
    nullable: true,
  })
  secondLastname: string;

  @Column('timestamp with time zone')
  birthday: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  weddingAniversary: Date;

  @Column('enum', { enum: ['M', 'F'] })
  genre: string;

  @Column('enum', { enum: ['Soltero', 'Casado', 'Divorciado', 'Viudo'] })
  maritalStatus: string;

  @Column('uuid')
  churchId: string;

  @ManyToOne(() => ChurchSchema, (church) => church.beneficient)
  @JoinColumn({ name: 'churchId' })
  church: ChurchSchema;

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
    nullable: true,
    unique: true,
  })
  email: string;

  @Column('enum', {
    enum: ['FISICA', 'MORAL'],
    nullable: true,
  })
  person: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  registeredName: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  rfc: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    nullable: true,
  })
  reasonDeactivated: string;

  @OneToOne(() => AssignationSchema, (assignation) => assignation.beneficient)
  assignation: AssignationSchema;
}
