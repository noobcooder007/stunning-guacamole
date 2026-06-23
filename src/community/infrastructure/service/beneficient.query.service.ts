import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';
import { GetBeneficientsActiveListQuery } from '@/community/application/query/get-beneficients-active-list.query';
import { GetUnassignedBeneficientsQuery } from '@/community/application/query/get-unassigned-beneficients.query';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { BeneficientListItemResponse } from '@/community/application/dto/beneficient-list-item.response';
import { UnassignedBeneficientResponse } from '@/community/application/dto/unassigned-beneficient.response';

@Injectable()
export class BeneficientQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getPaginated(
    query: GetBeneficientQueryParams,
  ): Promise<Paginated<BeneficientResponse>> {
    const { page, limit, ...filters } = query;
    const qb = this.getQueryBuilder(BeneficientSchema, 'beneficient');
    this.applyFilters(qb, 'beneficient', filters);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();
    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(
      items.map((item) => BeneficientMapper.fromModelToResponse(item)),
      meta,
    );
  }

  async getActiveList(
    query: GetBeneficientsActiveListQuery,
  ): Promise<BeneficientListItemResponse[]> {
    const qb = this.getQueryBuilder(BeneficientSchema, 'beneficient').where(
      'beneficient.isActive = :isActive',
      { isActive: true },
    );
    if (query.search) {
      query.search
        .trim()
        .split(/\s+/)
        .forEach((token, i) => {
          const param = `term${i}`;
          qb.andWhere(
            `(beneficient.firstname ILIKE :${param} OR beneficient.firstLastname ILIKE :${param} OR beneficient.secondLastname ILIKE :${param})`,
            { [param]: `%${token}%` },
          );
        });
    }
    const items = await qb.getMany();
    return items.map((item) => ({
      id: item.id,
      firstname: item.firstname,
      firstLastname: item.firstLastname,
      secondLastname: item.secondLastname,
      beneficientNumber: item.beneficientNumber,
    }));
  }

  async searchUnassigned(
    query: GetUnassignedBeneficientsQuery,
  ): Promise<Paginated<UnassignedBeneficientResponse>> {
    const { page, limit, ...filters } = query;
    const qb = this.getQueryBuilder(BeneficientSchema, 'b')
      .where('b.isActive = :bActive', { bActive: true })
      .andWhere((sq) => {
        const sub = sq
          .subQuery()
          .select('1')
          .from(AssignationSchema, 'a')
          .where('a.beneficientId = b.id')
          .andWhere('a.isActive = :aActive', { aActive: true })
          .getQuery();
        return `NOT EXISTS (${sub})`;
      });
    this.applyFilters(qb, 'b', filters);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();
    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(
      items.map((item) => ({
        id: item.id,
        firstname: item.firstname,
        firstLastname: item.firstLastname,
        secondLastname: item.secondLastname,
        beneficientNumber: item.beneficientNumber,
      })),
      meta,
    );
  }
}
