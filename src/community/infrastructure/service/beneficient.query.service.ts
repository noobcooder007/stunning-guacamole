import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import {
  GetBeneficientQueryParams,
  SearchBeneficientsQuery,
} from '@/community/application/query/get-beneficient-paginated.query';
import { GetUnassignedBeneficientsQuery } from '@/community/application/query/get-unassigned-beneficients.query';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { UnassignedBeneficientResponse } from '@/community/application/dto/unassigned-beneficient.response';

@Injectable()
export class BeneficientQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getPaginated(
    query: GetBeneficientQueryParams,
  ): Promise<Paginated<BeneficientResponse>> {
    const qb = this.getQueryBuilder(BeneficientSchema, 'beneficient');
    this.applyPagination(qb, query.page, query.limit);
    const [items, total] = await qb.getManyAndCount();
    const meta = new PaginationMetaDto(query.page, query.limit, total);
    return new Paginated(
      items.map((item) => BeneficientMapper.fromModelToResponse(item)),
      meta,
    );
  }

  async filterBeneficients(
    query: SearchBeneficientsQuery,
  ): Promise<BeneficientResponse[]> {
    const qb = this.getQueryBuilder(BeneficientSchema, 'beneficient');
    this.applyFilters(qb, 'beneficient', query);
    qb.take(20);
    const items = await qb.getMany();
    return items.map((item) => BeneficientMapper.fromModelToResponse(item));
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
