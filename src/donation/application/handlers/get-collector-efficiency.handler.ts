import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCollectorEfficiencyQuery } from '@/donation/application/query/get-collector-efficiency.query';
import { CollectorEfficiencyQueryService } from '@/donation/infrastructure/service/collector-efficiency.query.service';
import { CollectorEfficiencyResponseDto } from '@/donation/application/dto/collector-efficiency.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetCollectorEfficiencyQuery)
export class GetCollectorEfficiencyHandler
  implements IQueryHandler<GetCollectorEfficiencyQuery, Result<CollectorEfficiencyResponseDto>>
{
  constructor(
    private readonly efficiencyService: CollectorEfficiencyQueryService,
  ) {}

  async execute(
    query: GetCollectorEfficiencyQuery,
  ): Promise<Result<CollectorEfficiencyResponseDto>> {
    const data = await this.efficiencyService.getEfficiency(query.collectorId);
    return Result.ok(data);
  }
}
