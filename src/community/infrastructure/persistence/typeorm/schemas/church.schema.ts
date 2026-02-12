import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { BeneficientSchema } from './beneficient.schema';

@Entity('churches')
@Index(['name'])
@Index(['createdAt'])
@Unique(['vicaria', 'decanato', 'parroquia', 'capilla'])
@Unique(['street', 'noExt', 'city', 'state', 'zipCode'])
export class ChurchSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  vicaria: string;

  @Column('text')
  decanato: string;

  @Column('text')
  parroquia: string;

  @Column('text')
  capilla: string;

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

  @Column('text', {
    nullable: true,
  })
  locality: string;

  @Column('text')
  city: string;

  @Column('text')
  state: string;

  @Column('text')
  zipCode: string;

  @Column('text')
  priestFirstname: string;

  @Column('text')
  priestFirstLastname: string;

  @Column('text', {
    nullable: true,
  })
  priestSecondLastname: string;

  @Column('text')
  auxiliarPriestFirstname: string;

  @Column('text')
  auxiliarPriestFirstLastname: string;

  @Column('text', {
    nullable: true,
  })
  auxiliarPriestSecondLastname: string;

  @Column('text')
  phoneNumber: string;

  @OneToMany(() => BeneficientSchema, (beneficient) => beneficient.church)
  beneficient: BeneficientSchema;

  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  createdAt: Date;

  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;
}
