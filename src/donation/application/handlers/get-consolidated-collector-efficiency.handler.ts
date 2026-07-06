import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsolidatedCollectorEfficiencyQuery } from '@/donation/application/query/get-consolidated-collector-efficiency.query';
import { ConsolidatedCollectorEfficiencyQueryService } from '@/donation/infrastructure/service/consolidated-collector-efficiency.query.service';
import { ConsolidatedCollectorEfficiencyResponseDto } from '@/donation/application/dto/consolidated-collector-efficiency.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetConsolidatedCollectorEfficiencyQuery)
export class GetConsolidatedCollectorEfficiencyHandler implements IQueryHandler<
  GetConsolidatedCollectorEfficiencyQuery,
  Result<ConsolidatedCollectorEfficiencyResponseDto>
> {
  constructor(
    private readonly efficiencyService: ConsolidatedCollectorEfficiencyQueryService,
  ) {}

  async execute(
    _query: GetConsolidatedCollectorEfficiencyQuery,
  ): Promise<Result<ConsolidatedCollectorEfficiencyResponseDto>> {
    const data = await this.efficiencyService.getConsolidatedEfficiency();
    return Result.ok(data);
  }
}
