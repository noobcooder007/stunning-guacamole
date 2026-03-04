import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { GetPromiseDonationQueryParams } from '@/donation/application/query/get-promise-donation-paginated.query';
import { PromiseDonationResponse } from '@/donation/application/dto/promise-donation.response.dto';
import { PromiseDonationQueryService } from '@/donation/infrastructure/service/promise-donation.query.service';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetPromiseDonationQueryParams)
export class GetPromiseDonationsPaginatedHandler extends BaseQueryHandler<
  GetPromiseDonationQueryParams,
  Paginated<PromiseDonationResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly promisesQueryService: PromiseDonationQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetPromiseDonationQueryParams,
  ): Promise<Result<Paginated<PromiseDonationResponse>>> {
    const paginatedChurches =
      await this.promisesQueryService.searchPromiseDonations(query);
    return Result.ok<Paginated<PromiseDonationResponse>>(paginatedChurches);
  }
}
