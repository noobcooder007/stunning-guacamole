import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { GetBeneficientsActiveListQuery } from '@/community/application/query/get-beneficients-active-list.query';
import { BeneficientListItemResponse } from '@/community/application/dto/beneficient-list-item.response';
import { BeneficientQueryService } from '@/community/infrastructure/service/beneficient.query.service';

@QueryHandler(GetBeneficientsActiveListQuery)
export class GetBeneficientsActiveListHandler extends BaseQueryHandler<
  GetBeneficientsActiveListQuery,
  BeneficientListItemResponse[]
> {
  constructor(
    datasource: DataSource,
    private readonly beneficientQueryService: BeneficientQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetBeneficientsActiveListQuery,
  ): Promise<Result<BeneficientListItemResponse[]>> {
    const result = await this.beneficientQueryService.getActiveList(query);
    return Result.ok(result);
  }
}
