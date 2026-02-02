import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { ChurchResponse } from '../dto/church.response';
import { Result } from '@/shared/domain/dto/result.dto';
import { GetChurchQueryParams } from '../query/get-church-paginated.query';
import { Paginated } from '../../../shared/domain/dto/paginated.result.dto';
import { ChurchQueryService } from '@/community/infrastructure/service/church.query.service';

@QueryHandler(GetChurchQueryParams)
export class GetChurchPaginatedHandler extends BaseQueryHandler<
  GetChurchQueryParams,
  Paginated<ChurchResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly churchQueryService: ChurchQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetChurchQueryParams,
  ): Promise<Result<Paginated<ChurchResponse>>> {
    const paginatedChurches =
      await this.churchQueryService.searchChurches(query);
    return Result.ok<Paginated<ChurchResponse>>(paginatedChurches);
  }
}
