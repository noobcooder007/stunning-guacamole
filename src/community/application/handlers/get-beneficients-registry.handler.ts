import { DataSource } from 'typeorm';
import { QueryHandler } from '@nestjs/cqrs';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { GetBeneficientsRegistryQuery } from '@/community/application/query/get-beneficients-registry.query';
import { BeneficientsRegistryItemDto } from '@/community/application/dto/beneficients-registry.response';
import { BeneficientsRegistryQueryService } from '@/community/infrastructure/service/beneficients-registry.query.service';

@QueryHandler(GetBeneficientsRegistryQuery)
export class GetBeneficientsRegistryHandler extends BaseQueryHandler<
  GetBeneficientsRegistryQuery,
  Paginated<BeneficientsRegistryItemDto>
> {
  constructor(
    public readonly datasource: DataSource,
    private readonly registryService: BeneficientsRegistryQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetBeneficientsRegistryQuery,
  ): Promise<Result<Paginated<BeneficientsRegistryItemDto>, IErrorResult>> {
    const result = await this.registryService.getRegistry(
      query.page,
      query.limit,
    );
    return Result.ok(result);
  }
}
