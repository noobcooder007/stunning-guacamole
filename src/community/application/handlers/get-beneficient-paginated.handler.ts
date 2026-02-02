import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { Paginated } from '../../../shared/domain/dto/paginated.result.dto';
import { GetBeneficientQueryParams } from '../query/get-beneficient-paginated.query';
import { BeneficientResponse } from '../dto/beneficient.response';
import { BeneficientQueryService } from '@/community/infrastructure/service/beneficient.query.service';

@QueryHandler(GetBeneficientQueryParams)
export class GetBeneficientPaginatedHandler extends BaseQueryHandler<
  GetBeneficientQueryParams,
  Paginated<BeneficientResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly beneficientQueryService: BeneficientQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetBeneficientQueryParams,
  ): Promise<Result<Paginated<BeneficientResponse>>> {
    const paginatedChurches =
      await this.beneficientQueryService.searchBeneficients(query);
    return Result.ok<Paginated<BeneficientResponse>>(paginatedChurches);
  }
}
