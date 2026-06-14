import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { GetUnassignedBeneficientsQuery } from '@/community/application/query/get-unassigned-beneficients.query';
import { UnassignedBeneficientResponse } from '@/community/application/dto/unassigned-beneficient.response';
import { BeneficientQueryService } from '@/community/infrastructure/service/beneficient.query.service';

@QueryHandler(GetUnassignedBeneficientsQuery)
export class GetUnassignedBeneficientsHandler extends BaseQueryHandler<
  GetUnassignedBeneficientsQuery,
  Paginated<UnassignedBeneficientResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly beneficientQueryService: BeneficientQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetUnassignedBeneficientsQuery,
  ): Promise<Result<Paginated<UnassignedBeneficientResponse>>> {
    const result = await this.beneficientQueryService.searchUnassigned(query);
    return Result.ok(result);
  }
}
