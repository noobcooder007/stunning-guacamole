import { Entity, Column, PrimaryColumn, Unique, Check } from 'typeorm';

@Entity('receipt_sequences')
@Unique(['collectorId', 'type', 'year'])
export class ReceiptSequenceSchema {
  @PrimaryColumn('uuid')
  collectorId: string;

  @PrimaryColumn()
  type: string; // 'RECURRING', 'SPECIAL', 'IN_BLANK'

  @PrimaryColumn()
  year: number; // Ej: 2026

  @Column({ type: 'int', default: 0 })
  @Check(`"lastValue" >= 0`)
  lastValue: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
