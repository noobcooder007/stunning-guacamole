import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { IReceiptPersistence } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';

@Entity('receipts')
@Index(['folio', 'status'])
@Index(['promiseDonationId', 'beneficientId', 'collectorId'])
@Unique(['folio'])
@Unique(['promiseDonationId', 'periodMonth', 'periodYear'])
export class ReceiptSchema implements IReceiptPersistence {
  @PrimaryColumn('uuid')
  id: string;

  @Column('enum', {
    enum: ['PENDING', 'PAID', 'CANCELLED', 'SCHEDULED'],
  })
  status: string;

  @Column('text')
  folio: string;

  @Column('enum', {
    enum: ['RECURRING', 'SPECIAL'],
  })
  type: string;

  @Column('enum', {
    enum: ['PROMISE', 'NON_PROMISE'],
  })
  origin: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('text')
  currency: string;

  @Column('text', { nullable: true })
  paymentMethod: string;

  @Column('text', { nullable: true })
  externalReference: string;

  @Column('uuid', { nullable: true })
  promiseDonationId: string;

  @ManyToOne(() => PromiseDonationSchema)
  @JoinColumn({ name: 'promiseDonationId' })
  promiseDonation: PromiseDonationSchema;

  @Column('integer', { nullable: true })
  periodMonth: number;

  @Column('integer', { nullable: true })
  periodYear: number;

  @Column('uuid', { nullable: true })
  beneficientId: string;

  @ManyToOne(() => BeneficientSchema)
  @JoinColumn({ name: 'beneficientId' })
  beneficient: BeneficientSchema;

  @Column('uuid', { nullable: true })
  collectorId: string;

  @ManyToOne(() => CollectorSchema)
  @JoinColumn({ name: 'collectorId' })
  collector: CollectorSchema;

  @Column('integer')
  printCount: number;

  @Column('timestamp with time zone', { nullable: true })
  lastPrintedAt: Date;

  @Column('text', { nullable: true })
  voidReason: string;

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  createdAt: Date;

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  updatedAt: Date;

  @Column('uuid')
  createdBy: string;

  @Column('uuid')
  updatedBy: string;

  @Column('text', { nullable: true })
  chainValidator: string;

  @Column('uuid', { nullable: true })
  collectionPeriodId: string;

  @Column('timestamp with time zone', { nullable: true })
  paidAt: Date;
}
