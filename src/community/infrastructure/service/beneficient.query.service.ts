import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BeneficientSchema } from '../persistence/typeorm/schemas/beneficient.schema';
import { BeneficientMapper } from '../persistence/mappers/beneficient.mapper';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';

@Injectable()
export class BeneficientQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchBeneficients(
    query: GetBeneficientQueryParams,
  ): Promise<Paginated<any>> {
    const { offset, limit, ...filters } = query;
    const qb = this.getQueryBuilder(BeneficientSchema, 'beneficient');
    this.applyFilters(qb, 'beneficient', filters);
    const [items, total] = await Promise.all([
      qb.clone().limit(limit).offset(offset).getMany(),
      qb.clone().getCount(),
    ]);

    const meta = new PaginationMetaDto(offset, limit, total);
    return new Paginated(
      items.map((item) => BeneficientMapper.fromModelToResponse(item)),
      meta,
    );
  }
}
