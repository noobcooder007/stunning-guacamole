import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { Paginated } from '../../../shared/domain/dto/paginated.result.dto';
import { GetCollectorQueryParams } from '../query/get-collector-paginated.query';
import { CollectorResponse } from '../dto/collector.response';
import { CollectorQueryService } from '@/community/infrastructure/service/collector.query.service';

@QueryHandler(GetCollectorQueryParams)
export class GetCollectorPaginatedHandler extends BaseQueryHandler<
  GetCollectorQueryParams,
  Paginated<CollectorResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly CollectorQueryService: CollectorQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetCollectorQueryParams,
  ): Promise<Result<Paginated<CollectorResponse>>> {
    const paginatedChurches =
      await this.CollectorQueryService.searchCollectors(query);
    return Result.ok<Paginated<CollectorResponse>>(paginatedChurches);
  }
}
