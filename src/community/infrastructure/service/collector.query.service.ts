import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';
import { CollectorResponse } from '@/community/application/dto/collector.response';

@Injectable()
export class CollectorQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchCollectors(
    query: GetCollectorQueryParams,
  ): Promise<Paginated<CollectorResponse>> {
    const { page, limit, ...filters } = query;
    const qb = this.getQueryBuilder(CollectorSchema, 'collector');
    this.applyFilters(qb, 'collector', filters);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();

    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(
      items.map((item) => CollectorMapper.fromModelToResponse(item)),
      meta,
    );
  }
}
