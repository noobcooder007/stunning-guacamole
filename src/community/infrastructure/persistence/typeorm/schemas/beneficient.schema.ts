import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { IBeneficientPersistence } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { EncryptionService } from '@/shared/infrastructure/services/encryption.service';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';

@Entity('beneficients')
@Index(['createdAt'])
export class BeneficientSchema implements IBeneficientPersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Column('enum', {
    enum: ['Sr', 'Sra', 'Srta', 'Srto'],
    nullable: true,
  })
  title: string;

  @Column('uuid')
  profileId: string;

  @OneToOne(() => ProfileSchema, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'profileId' })
  profile: ProfileSchema;

  @Column('timestamp with time zone')
  birthday: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  weddingAnniversary: Date;

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
  })
  emailHash: string;

  @Column('enum', {
    enum: ['FISICA', 'MORAL'],
    nullable: true,
  })
  person: string;

  @Column('text', {
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

  @Column('timestamp with time zone', {
    nullable: true,
  })
  deactivatedAt: Date;

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
