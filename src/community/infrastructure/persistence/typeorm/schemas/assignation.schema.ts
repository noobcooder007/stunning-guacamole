import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
} from 'typeorm';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { IAssignationPersistence } from '@/community/infrastructure/persistence/mappers/assignation.mapper';

@Entity('assignations')
@Index(['collectorId', 'beneficientId'], { unique: true })
@Index('IDX_UQ_ACTIVE_PROMISE_DONATION', ['beneficientId'], {
  unique: true,
  where: '"isActive" = true',
})
@Check(
  `"isActive" = true OR ("isActive" = false AND "reasonDeactivated" IS NOT NULL AND "reasonDeactivated" <> '')`,
)
export class AssignationSchema implements IAssignationPersistence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  collectorId: string;

  @ManyToOne(() => CollectorSchema, (collector) => collector.assignations)
  @JoinColumn({ name: 'collectorId' })
  collector: CollectorSchema;

  @Column('uuid')
  beneficientId: string;

  @ManyToOne(() => BeneficientSchema, (beneficient) => beneficient.assignation)
  @JoinColumn({ name: 'beneficientId' })
  beneficient: BeneficientSchema;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    nullable: true,
  })
  reasonDeactivated: string;
}
