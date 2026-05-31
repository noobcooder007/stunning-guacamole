import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { Result } from '@/shared/domain/dto/result.dto';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { GetPromiseDonationQueryParams } from '@/donation/application/query/get-promise-donation-paginated.query';
import { GetPromiseDonationWithBeneficientsQueryParams } from '@/donation/application/query/get-promise-donation-with-beneficients-paginated.query';
import { PromiseDonationWithBeneficientsResponse } from '@/donation/application/dto/promise-donation-with-beneficients.response.dto';
import { PromiseDonationQueryService } from '@/donation/infrastructure/service/promise-donation.query.service';

@QueryHandler(GetPromiseDonationWithBeneficientsQueryParams)
export class GetPromiseDonationsWithBeneficientPaginatedHandler extends BaseQueryHandler<
  GetPromiseDonationQueryParams,
  Paginated<PromiseDonationWithBeneficientsResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly promisesQueryService: PromiseDonationQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetPromiseDonationWithBeneficientsQueryParams,
  ): Promise<Result<Paginated<PromiseDonationWithBeneficientsResponse>>> {
    const paginatedPromisesDonation =
      await this.promisesQueryService.searchPromiseDonationsWithBeneficients(
        query,
      );
    return Result.ok<Paginated<PromiseDonationWithBeneficientsResponse>>(
      paginatedPromisesDonation,
    );
  }
}
