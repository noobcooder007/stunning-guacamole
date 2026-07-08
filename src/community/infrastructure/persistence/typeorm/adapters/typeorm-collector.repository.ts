import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { ProfileMapper } from '@/community/infrastructure/persistence/mappers/profile.mapper';

export interface CollectorFilters {
  id?: string;
  telephoneNumberHash?: string;
  nssHash?: string;
}

@Injectable()
export class TypeORMCollectorRepository
  extends BaseRepository<CollectorSchema>
  implements ICollectorRepository
{
  constructor(datasource: DataSource) {
    super(datasource, CollectorSchema);
  }

  private toDomain(collectorModel: CollectorSchema): Collector {
    return CollectorMapper.toDomain(
      collectorModel,
      ProfileMapper.toDomain(collectorModel.profile),
    );
  }

  async isActive(id: string): Promise<boolean> {
    return await this.repository.exists({ where: { id, isActive: true } });
  }

  async exists(filters: CollectorFilters): Promise<boolean> {
    if (filters.id) {
      return await this.repository.exists({ where: { id: filters.id } });
    }
    const where: FindOptionsWhere<CollectorSchema>[] = [];
    if (filters.telephoneNumberHash) {
      where.push({
        telephoneNumberHash: filters.telephoneNumberHash,
      });
    }
    if (filters.nssHash) {
      where.push({
        nssHash: filters.nssHash,
      });
    }
    // Un where vacío hace que TypeORM no aplique ningún WHERE y matchee
    // cualquier fila de la tabla; sin criterios no hay nada que comparar.
    if (where.length === 0) return false;
    const exists = await this.repository.exists({ where });
    return !!exists;
  }

  async findById(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository.findOne({
      where: { id, isActive: true },
      relations: ['profile'],
    });
    return collectorModel ? this.toDomain(collectorModel) : null;
  }

  async findInactiveById(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository.findOne({
      where: { id, isActive: false },
      relations: ['profile'],
    });
    return collectorModel ? this.toDomain(collectorModel) : null;
  }

  async findByIdWithAssignations(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository
      .createQueryBuilder('collector')
      .leftJoinAndSelect('collector.profile', 'profile')
      .leftJoinAndSelect(
        'collector.assignations',
        'assignations',
        'assignations.isActive = :isActive',
        { isActive: true },
      )
      .where('collector.id = :id', { id })
      .andWhere('collector.isActive = :isActive', { isActive: true })
      .getOne();
    return collectorModel ? this.toDomain(collectorModel) : null;
  }

  async findAll(offset: number, limit: number): Promise<Collector[]> {
    const collectorsModelList = await this.repository.find({
      where: { isActive: true },
      relations: ['profile'],
      skip: offset,
      take: limit,
    });
    return collectorsModelList.map((collectorModel) => {
      return this.toDomain(collectorModel);
    });
  }

  async save(collector: Collector): Promise<void> {
    await this.repository.save(CollectorMapper.toPersistence(collector));
  }
}
