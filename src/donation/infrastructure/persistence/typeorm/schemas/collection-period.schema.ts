import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('collection_periods')
// Partial unique index: only one OPEN period at a time
@Index('UQ_ONE_OPEN_PERIOD', ['status'], {
  unique: true,
  where: "status = 'OPEN'",
})
// Partial unique index: only one SCHEDULED (not yet open) period at a time
@Index('UQ_ONE_SCHEDULED_PERIOD', ['status'], {
  unique: true,
  where: "status = 'SCHEDULED'",
})
export class CollectionPeriodSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('integer')
  month: number;

  @Column('integer')
  year: number;

  @Column('enum', { enum: ['OPEN', 'CLOSED', 'SCHEDULED'] })
  status: string;

  @Column('timestamp with time zone', { nullable: true })
  closedAt: Date;

  @Column('uuid', { nullable: true })
  closedBy: string;

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  createdAt: Date;

  @Column('uuid')
  createdBy: string;

  @Column('decimal', { precision: 14, scale: 2, nullable: true })
  totalCollected: number;

  @Column('decimal', { precision: 14, scale: 2, nullable: true })
  totalCommissions: number;

  @Column('decimal', { precision: 14, scale: 2, nullable: true })
  totalNet: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  exchangeRateUsdToMxn: number;
}
