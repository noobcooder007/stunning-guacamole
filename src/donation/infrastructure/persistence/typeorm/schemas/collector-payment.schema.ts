import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

@Entity('collector_payments')
@Index(['settlementId'])
@Index(['collectorId'])
export class CollectorPaymentSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  settlementId: string;

  @Column('uuid')
  collectorId: string;

  @Column('decimal', { precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  paymentMethod: CollectorPaymentMethod;

  @Column('text', { nullable: true })
  reference: string | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @Column('timestamp with time zone')
  paidAt: Date;

  @Column('uuid')
  registeredBy: string;

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  createdAt: Date;
}
