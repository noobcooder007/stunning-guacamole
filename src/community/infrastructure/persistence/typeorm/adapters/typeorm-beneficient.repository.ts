import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { BaseRepository } from '@/database/base.repository';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { IBeneficientRepository } from '@/community/application/repositories/beneficient.repository';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';

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

  async exists(beneficient: Beneficient): Promise<boolean> {
    const exists = await this.repository.findOne({
      where: [
        {
          firstname: beneficient.firstname,
          firstLastname: beneficient.firstLastname,
          secondLastname: beneficient.secondLastname,
        },
        {
          street: beneficient.address.street,
          noExt: beneficient.address.numeration.noExt,
          city: beneficient.address.city,
          state: beneficient.address.state,
          zipCode: beneficient.address.zipCode.value,
        },
      ],
    });
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
