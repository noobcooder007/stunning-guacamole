import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { SearchBeneficientsQuery } from '@/community/application/query/get-beneficient-paginated.query';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { BeneficientQueryService } from '@/community/infrastructure/service/beneficient.query.service';

@QueryHandler(SearchBeneficientsQuery)
export class SearchBeneficientsHandler extends BaseQueryHandler<
  SearchBeneficientsQuery,
  BeneficientResponse[]
> {
  constructor(
    datasource: DataSource,
    private readonly beneficientQueryService: BeneficientQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: SearchBeneficientsQuery,
  ): Promise<Result<BeneficientResponse[]>> {
    const results = await this.beneficientQueryService.filterBeneficients(query);
    return Result.ok(results);
  }
}
