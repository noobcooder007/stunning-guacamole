import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ICollectorSettlementRepository } from '@/donation/domain/repositories/collector-settlement.repository';
import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorSettlementSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collector-settlement.schema';
import { CollectorSettlementMapper } from '@/donation/infrastructure/persistence/mappers/collector-settlement.mapper';

@Injectable()
export class TypeORMCollectorSettlementRepository
  extends BaseRepository<CollectorSettlementSchema>
  implements ICollectorSettlementRepository
{
  constructor(datasource: DataSource) {
    super(datasource, CollectorSettlementSchema);
  }

  async saveMany(settlements: CollectorSettlement[]): Promise<void> {
    const rows = settlements.map((s) =>
      CollectorSettlementMapper.toPersistence(s),
    );
    await this.repository.save(rows);
  }

  async save(settlement: CollectorSettlement): Promise<void> {
    await this.repository.save(
      CollectorSettlementMapper.toPersistence(settlement),
    );
  }

  async findByPeriodId(periodId: string): Promise<CollectorSettlement[]> {
    const rows = await this.repository.find({
      where: { collectionPeriodId: periodId },
    });
    return rows.map((r) => CollectorSettlementMapper.toDomain(r));
  }

  async findById(id: string): Promise<CollectorSettlement | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? CollectorSettlementMapper.toDomain(row) : null;
  }

  async findPendingByPeriodId(
    periodId: string,
  ): Promise<CollectorSettlement[]> {
    const rows = await this.repository.find({
      where: {
        collectionPeriodId: periodId,
        paymentStatus: Not(CollectorSettlementPaymentStatus.PAID),
      },
    });
    return rows.map((r) => CollectorSettlementMapper.toDomain(r));
  }
}
