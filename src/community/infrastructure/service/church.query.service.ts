import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { ChurchSchema } from '../persistence/typeorm/schemas/church.schema';
import { ChurchMapper } from '../persistence/mappers/church.mapper';
import { GetChurchQueryParams } from '@/community/application/query/get-church-paginated.query';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';

@Injectable()
export class ChurchQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchChurches(query: GetChurchQueryParams): Promise<Paginated<any>> {
    const { offset, limit, ...filters } = query;
    const qb = this.getQueryBuilder(ChurchSchema, 'church');
    this.applyFilters(qb, 'church', filters);
    const [items, total] = await Promise.all([
      qb.clone().limit(limit).offset(offset).getMany(),
      qb.clone().getCount(),
    ]);

    const meta = new PaginationMetaDto(offset, limit, total);
    return new Paginated(
      items?.map((item) => ChurchMapper.fromModelToResponse(item)),
      meta,
    );
  }
}
