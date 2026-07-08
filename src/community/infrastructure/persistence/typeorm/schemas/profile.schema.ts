import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';
import { IProfilePersistence } from '@/community/infrastructure/persistence/mappers/profile.mapper';
import { EncryptionService } from '@/shared/infrastructure/services/encryption.service';

@Entity('profiles')
@Index(['state', 'city'])
@Index(['createdAt'])
@Unique(['firstname', 'firstLastname', 'secondLastname'])
export class ProfileSchema implements IProfilePersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text')
  firstname: string;

  @Column('text')
  firstLastname: string;

  @Column('text', {
    nullable: true,
  })
  secondLastname: string;

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
    select: false,
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
  phoneNumber: string;

  @Column('text', {
    nullable: true,
    select: false,
    unique: true,
  })
  phoneNumberHash: string;

  @Column('timestamp with time zone')
  createdAt: Date;
}
