import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { BeneficientsRegistryItemDto } from '@/community/application/dto/beneficients-registry.response';

@Injectable()
export class BeneficientsRegistryQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getRegistry(
    page: number,
    limit: number,
  ): Promise<Paginated<BeneficientsRegistryItemDto>> {
    const safeLimit = Math.max(limit, 1);
    const safePage = Math.max(page, 1);

    const [beneficients, total] = await this.getQueryBuilder(
      BeneficientSchema,
      'b',
    )
      .orderBy('b.beneficientNumber', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    if (beneficients.length === 0) {
      return new Paginated([], new PaginationMetaDto(page, limit, total));
    }

    const items = await this._mapBeneficients(beneficients);
    return new Paginated(items, new PaginationMetaDto(page, limit, total));
  }

  async getAll(): Promise<BeneficientsRegistryItemDto[]> {
    const beneficients = await this.getQueryBuilder(BeneficientSchema, 'b')
      .orderBy('b.beneficientNumber', 'ASC')
      .getMany();

    if (beneficients.length === 0) return [];
    return this._mapBeneficients(beneficients);
  }

  private async _mapBeneficients(
    beneficients: BeneficientSchema[],
  ): Promise<BeneficientsRegistryItemDto[]> {
    const ids = beneficients.map((b) => b.id);

    const assignations = await this.getQueryBuilder(AssignationSchema, 'a')
      .leftJoinAndSelect('a.collector', 'c')
      .where('a.beneficientId IN (:...ids)', { ids })
      .andWhere('a.isActive = :isActive', { isActive: true })
      .getMany();

    const assignationMap = new Map(
      assignations.map((a) => [a.beneficientId, a]),
    );

    return beneficients.map((b) => {
      const assignation = assignationMap.get(b.id);
      return {
        beneficientNumber: b.beneficientNumber,
        title: b.title,
        firstname: b.firstname,
        firstLastname: b.firstLastname,
        secondLastname: b.secondLastname ?? null,
        birthday: b.birthday,
        genre: b.genre,
        maritalStatus: b.maritalStatus,
        email: b.email ?? null,
        phoneNumber: b.phoneNumber ?? null,
        street: b.street,
        noExt: b.noExt,
        noInt: b.noInt ?? null,
        neighborhood: b.neighborhood ?? null,
        locality: b.locality ?? null,
        city: b.city,
        state: b.state,
        zipCode: b.zipCode,
        createdAt: b.createdAt,
        reasonDeactivated: b.reasonDeactivated ?? null,
        isActive: b.isActive,
        collectorNumber: assignation?.collector?.collectorNumber ?? null,
        collectorFirstname: assignation?.collector?.firstname ?? null,
        collectorFirstLastname: assignation?.collector?.firstLastname ?? null,
      };
    });
  }
}
