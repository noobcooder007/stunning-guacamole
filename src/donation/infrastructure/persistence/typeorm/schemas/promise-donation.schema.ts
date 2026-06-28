import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import {
  ICollectorInstructionsPersistence,
  IPromiseDonationPersistence,
} from '@/donation/infrastructure/persistence/mappers/promise-donation.mapper';

@Entity('promise_donations')
@Unique(['beneficientId'])
@Index(['isActive', 'nextDonation'])
@Check(
  `"isActive" = true OR ("isActive" = false AND "reasonDeactivated" IS NOT NULL AND "reasonDeactivated" <> '')`,
)
export class PromiseDonationSchema implements IPromiseDonationPersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  beneficientId: string;

  @OneToOne(
    () => BeneficientSchema,
    (beneficient) => beneficient.promiseDonation,
  )
  @JoinColumn({ name: 'beneficientId' })
  beneficient: BeneficientSchema;

  @Column('decimal', { precision: 12, scale: 2 })
  promiseAmount: number;

  @Index()
  @Column('enum', {
    enum: ['USD', 'MXN'],
  })
  currency: string;

  @Column('text')
  method: string;

  @Column('timestamp with time zone')
  startDate: Date;

  @Column('boolean')
  recurring: boolean;

  @Column('integer')
  recurrence: number;

  @Column('timestamp with time zone', { nullable: true })
  lastDonation?: Date;

  @Column('timestamp with time zone', { nullable: true })
  nextDonation?: Date;

  @Index()
  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { name: 'reasonDeactivated', nullable: true })
  reasonDeactivate?: string;

  @Column('uuid')
  createdBy: string;

  @Column('timestamp without time zone', { default: () => 'NOW()' })
  createdAt: Date;

  @Column('timestamp without time zone', { default: () => 'NOW()' })
  updatedAt: Date;

  @Column('json', {
    nullable: true,
  })
  instructions?: ICollectorInstructionsPersistence;
}
