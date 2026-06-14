import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';
import { CollectorSettlementPaymentStatus } from '@/donation/domain/entities/collector-settlement.entity';

@Entity('collector_settlements')
@Unique(['collectionPeriodId', 'collectorId'])
export class CollectorSettlementSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  collectionPeriodId: string;

  @Column('uuid')
  collectorId: string;

  @Column('integer')
  month: number;

  @Column('integer')
  year: number;

  @Column('decimal', { precision: 14, scale: 2 })
  totalCollected: number;

  @Column('integer')
  commissionPercent: number;

  @Column('decimal', { precision: 14, scale: 2 })
  commissionAmount: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  nomina: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  transportAllowance: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  netCommission: number;

  @Column({
    type: 'varchar',
    default: CollectorSettlementPaymentStatus.PENDING,
  })
  paymentStatus: CollectorSettlementPaymentStatus;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  totalPaid: number;

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  createdAt: Date;
}
