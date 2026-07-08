import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { UserSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/user.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { ICollectorPersistence } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { EncryptionService } from '@/shared/infrastructure/services/encryption.service';

@Entity('collectors')
@Index(['createdAt'])
@Unique(['collectorNumber'])
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

  @Column('uuid')
  profileId: string;

  @OneToOne(() => ProfileSchema, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'profileId' })
  profile: ProfileSchema;

  @Column('text', {
    unique: true,
    transformer: {
      to: (value: string) =>
        EncryptionService.instance?.encrypt(value) ?? value,
      from: (value: string) =>
        EncryptionService.instance?.decrypt(value) ?? value,
    },
  })
  nss: string;

  @Column('text', {
    unique: true,
  })
  nssHash: string;

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
  telephoneNumber: string;

  @Column('text', {
    nullable: true,
    select: false,
  })
  telephoneNumberHash: string;

  @Column('int')
  commissionPercent: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  nomina: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  transportAllowance: number;

  @Column('text', {
    nullable: true,
  })
  bank: string;

  @Column('text', {
    nullable: true,
  })
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

  @Column('text', {
    nullable: true,
  })
  profilePath: string;

  @Column('int', {
    unique: true,
  })
  @Generated('increment')
  collectorNumber: number;
}
