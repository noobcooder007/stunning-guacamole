import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { GetCollectorsActiveListQuery } from '@/community/application/query/get-collectors-active-list.query';
import { CollectorListItemResponse } from '@/community/application/dto/collector-list-item.response';
import { CollectorQueryService } from '@/community/infrastructure/service/collector.query.service';

@QueryHandler(GetCollectorsActiveListQuery)
export class GetCollectorsActiveListHandler extends BaseQueryHandler<
  GetCollectorsActiveListQuery,
  CollectorListItemResponse[]
> {
  constructor(
    datasource: DataSource,
    private readonly collectorQueryService: CollectorQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetCollectorsActiveListQuery,
  ): Promise<Result<CollectorListItemResponse[]>> {
    const result = await this.collectorQueryService.getActiveList(query);
    return Result.ok(result);
  }
}
