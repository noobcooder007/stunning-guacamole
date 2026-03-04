import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { PromiseDonationMapper } from '@/donation/infrastructure/persistence/mappers/promise-donation.mapper';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';

@Injectable()
export class TypeORMPromiseDonationRepository
  extends BaseRepository<PromiseDonationSchema>
  implements IPromiseDonationRepository
{
  constructor(datasource: DataSource) {
    super(datasource, PromiseDonationSchema);
  }

  async save(promiseDonation: PromiseDonation): Promise<void> {
    const promiseToSave = PromiseDonationMapper.toPersistence(promiseDonation);
    await this.repository.save(promiseToSave);
  }

  async exists(beneficientId: string): Promise<boolean> {
    return this.repository.exists({ where: { beneficientId } });
  }

  async findById(id: string): Promise<PromiseDonation | null> {
    const promiseModel = await this.repository.findOne({ where: { id } });
    if (!promiseModel) return null;
    return PromiseDonationMapper.toDomain(promiseModel);
  }
}
