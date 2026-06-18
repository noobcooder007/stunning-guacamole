import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { CollectionPeriod } from '@/donation/domain/aggregates/collection-period.aggregate';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import { CollectionPeriodMapper } from '@/donation/infrastructure/persistence/mappers/collection-period.mapper';

@Injectable()
export class TypeORMCollectionPeriodRepository
  extends BaseRepository<CollectionPeriodSchema>
  implements ICollectionPeriodRepository
{
  constructor(datasource: DataSource) {
    super(datasource, CollectionPeriodSchema);
  }

  async findOpen(): Promise<CollectionPeriod | null> {
    const raw = await this.repository.findOne({ where: { status: 'OPEN' } });
    if (!raw) return null;
    return CollectionPeriodMapper.toDomain(raw);
  }

  async findLastClosed(): Promise<CollectionPeriod | null> {
    const raw = await this.repository.findOne({
      where: { status: 'CLOSED' },
      order: { year: 'DESC', month: 'DESC' },
    });
    if (!raw) return null;
    return CollectionPeriodMapper.toDomain(raw);
  }

  async findById(id: string): Promise<CollectionPeriod | null> {
    const raw = await this.repository.findOne({ where: { id } });
    if (!raw) return null;
    return CollectionPeriodMapper.toDomain(raw);
  }

  async save(period: CollectionPeriod): Promise<void> {
    await this.repository.save(CollectionPeriodMapper.toPersistence(period));
  }
}
