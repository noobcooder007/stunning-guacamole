import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { IBeneficientPersistence } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { EncryptionService } from '@/shared/infrastructure/services/encryption.service';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';

@Entity('beneficients')
@Index(['state', 'city'])
@Index(['createdAt'])
@Unique(['firstname', 'firstLastname', 'secondLastname'])
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

  @Column('text', {
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  street: string;

  @Column('text', {
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  noExt: string;

  @Column('text', {
    nullable: true,
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  noInt: string;

  @Column('text', {
    nullable: true,
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  neighborhood: string;

  @Column('text', {
    nullable: true,
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  locality: string;

  @Column('text')
  city: string;

  @Column('text')
  state: string;

  @Column('text')
  zipCode: string;

  @Column('text', {
    unique: true,
  })
  addressHash: string;

  @Column('text', {
    nullable: true,
    unique: true,
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  email: string;

  @Column('text', {
    nullable: true,
    unique: true,
  })
  emailHash: string;

  @Column('text', {
    nullable: true,
    unique: true,
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  phoneNumber: string;

  @Column('text', {
    nullable: true,
    unique: true,
  })
  phoneNumberHash: string;

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
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  rfc: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  rfcHash: string;

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

  @OneToOne(() => PromiseDonationSchema, (promise) => promise.beneficient)
  promiseDonation: PromiseDonationSchema;

  @Column('int', {
    unique: true,
  })
  @Generated('increment')
  beneficientNumber: number;

  @Column('bool', {
    default: false,
  })
  keepPrivate: boolean;
}
