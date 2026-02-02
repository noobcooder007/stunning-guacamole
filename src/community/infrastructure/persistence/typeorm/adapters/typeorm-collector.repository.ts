import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ICollectorRepository } from '@/community/application/repositories/collector.repository';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';

@Injectable()
export class TypeORMCollectorRepository
  extends BaseRepository<CollectorSchema>
  implements ICollectorRepository
{
  constructor(datasource: DataSource) {
    super(datasource, CollectorSchema);
  }

  async exists(collector: Collector): Promise<boolean> {
    const exists = await this.repository.findOne({
      where: [
        {
          firstname: collector.firstname,
          firstLastname: collector.firstLastname,
          secondLastname: collector.secondLastname,
        },
        {
          street: collector.address.street,
          noExt: collector.address.numeration.noExt,
          city: collector.address.city,
          state: collector.address.state,
          zipCode: collector.address.zipCode.value,
        },
      ],
    });
    return !!exists;
  }

  async findById(id: string): Promise<Collector | null> {
    const collectorModel = await this.repository.findOne({
      where: { id, isActive: true },
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
