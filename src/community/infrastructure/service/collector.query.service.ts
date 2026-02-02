import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { CollectorSchema } from '../persistence/typeorm/schemas/collector.schema';
import { CollectorMapper } from '../persistence/mappers/collector.mapper';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';

@Injectable()
export class CollectorQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchCollectors(
    query: GetCollectorQueryParams,
  ): Promise<Paginated<any>> {
    const { offset, limit, ...filters } = query;
    const qb = this.getQueryBuilder(CollectorSchema, 'collector');
    this.applyFilters(qb, 'collector', filters);
    const [items, total] = await Promise.all([
      qb.clone().limit(limit).offset(offset).getMany(),
      qb.clone().getCount(),
    ]);

    const meta = new PaginationMetaDto(offset, limit, total);
    return new Paginated(
      items.map((item) => CollectorMapper.fromModelToResponse(item)),
      meta,
    );
  }
}
