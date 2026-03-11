import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';

@Injectable()
export class BeneficientQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchBeneficients(
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
}
