import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity('churches')
export class ChurchModel {
  @PrimaryGeneratedColumn('uuid')
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
  city: string;
  @Column('text')
  state: string;
  @Column('text')
  zipCode: string;
  @Column('text')
  principalFirstname: string;
  @Column('text')
  principalFirstLastname: string;
  @Column('text', {
    nullable: true,
  })
  principalSecondLastname: string;
  @Column('text')
  auxiliarFirstname: string;
  @Column('text')
  auxiliarFirstLastname: string;
  @Column('text', {
    nullable: true,
  })
  auxiliarSecondLastname: string;
  @Column('text')
  phoneNumber: string;
  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  createdAt: Timestamp;
  @Column('timestamp without time zone', {
    default: () => 'NOW()',
  })
  updatedAt: Timestamp;
  @Column('bool', {
    default: true,
  })
  isActive: boolean;
}
