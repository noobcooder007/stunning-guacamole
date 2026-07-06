import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export type AuditStatus = 'SUCCESS' | 'FAILURE';

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['operation', 'createdAt'])
export class AuditLogSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('text', { nullable: true })
  traceId: string;

  @Index()
  @Column('uuid', { nullable: true })
  userId: string;

  @Column('text')
  operation: string;

  @Column('enum', { enum: ['SUCCESS', 'FAILURE'] })
  status: AuditStatus;

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('integer')
  durationMs: number;

  @Column('text', { nullable: true })
  ip: string;

  @Column('text', { nullable: true })
  userAgent: string;

  @Index()
  @Column('timestamp with time zone', { default: () => 'NOW()' })
  createdAt: Date;
}
