import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';

export interface CollectorFilters {
  id?: string;
  firstname?: string;
  firstLastname?: string;
  secondLastname?: string | null;
  addressHash?: string;
  phoneNumberHash?: string;
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

  async isActive(id: string): Promise<boolean> {
    return await this.repository.exists({ where: { id, isActive: true } });
  }

  async exists(filters: CollectorFilters): Promise<boolean> {
    if (filters.id) {
      return await this.repository.exists({ where: { id: filters.id } });
    }
    const where: FindOptionsWhere<CollectorSchema>[] = [];
    if (filters.firstname && filters.firstLastname) {
      where.push({
        firstname: filters.firstname,
        firstLastname: filters.firstLastname,
        secondLastname: filters.secondLastname ?? null,
      });
    }
    if (filters.addressHash) {
      where.push({
        addressHash: filters.addressHash,
      });
    }
    if (filters.phoneNumberHash) {
      where.push({
        phoneNumberHash: filters.phoneNumberHash,
      });
    }
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
    const exists = await this.repository.exists({ where });
    return !!exists;
  }

  async findById(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository.findOne({
      where: { id, isActive: true },
    });
    return collectorModel ? CollectorMapper.toDomain(collectorModel) : null;
  }

  async findInactiveById(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository.findOne({
      where: { id, isActive: false },
    });
    return collectorModel ? CollectorMapper.toDomain(collectorModel) : null;
  }

  async findByIdWithAssignations(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository
      .createQueryBuilder('collector')
      .leftJoinAndSelect(
        'collector.assignations',
        'assignations',
        'assignations.isActive = :isActive',
        { isActive: true },
      )
      .where('collector.id = :id', { id })
      .andWhere('collector.isActive = :isActive', { isActive: true })
      .getOne();
    return collectorModel ? CollectorMapper.toDomain(collectorModel) : null;
  }

  async findAll(offset: number, limit: number): Promise<Collector[]> {
    const collectorsModelList = await this.repository.find({
      where: { isActive: true },
      skip: offset,
      take: limit,
    });
    return collectorsModelList.map((collectorModel) => {
      return CollectorMapper.toDomain(collectorModel);
    });
  }

  async save(collector: Collector): Promise<void> {
    await this.repository.save(CollectorMapper.toPersistence(collector));
  }
}
