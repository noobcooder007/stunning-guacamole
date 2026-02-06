import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, In } from 'typeorm';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { BaseRepository } from '@/database/base.repository';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';

export interface BeneficientFilters {
  firstname?: string;
  firstLastname?: string;
  secondLastname?: string;
  addressHash?: string;
  emailHash?: string;
  rfcHash?: string;
}

@Injectable()
export class TypeORMBeneficientRepository
  extends BaseRepository<BeneficientSchema>
  implements IBeneficientRepository
{
  constructor(datasource: DataSource) {
    super(datasource, BeneficientSchema);
  }

  async save(beneficient: Beneficient): Promise<Beneficient> {
    await this.repository.save(BeneficientMapper.toPersistence(beneficient));
    return beneficient;
  }

  async findById(id: string): Promise<Beneficient | null> {
    const beneficientModel = await this.repository.findOne({
      where: { id },
    });
    return BeneficientMapper.toDomain(beneficientModel);
  }

  async findAll(offset: number, limit: number): Promise<Beneficient[] | []> {
    const beneficentModelList = await this.repository.find({
      where: { isActive: true },
      skip: offset,
      take: limit,
    });
    return beneficentModelList.map((beneficientModel) => {
      return BeneficientMapper.toDomain(beneficientModel);
    });
  }

  async exists(filters: BeneficientFilters): Promise<boolean> {
    const where: FindOptionsWhere<BeneficientSchema>[] = [];
    if (filters.firstname && filters.firstLastname && filters.secondLastname) {
      where.push({
        firstname: filters.firstname,
        firstLastname: filters.firstLastname,
        secondLastname: filters.secondLastname,
      });
    }
    if (filters.addressHash) where.push({ addressHash: filters.addressHash });
    if (filters.emailHash) where.push({ emailHash: filters.emailHash });
    if (filters.rfcHash) where.push({ rfcHash: filters.rfcHash });
    const exists = await this.repository.exists({ where });
    return !!exists;
  }

  async inIds(ids: string[]): Promise<Beneficient[] | []> {
    const beneficientsModel = await this.repository.find({
      where: { id: In(ids), isActive: true },
    });
    return beneficientsModel.map((beneficientsModel) => {
      return BeneficientMapper.toDomain(beneficientsModel);
    });
  }
}
