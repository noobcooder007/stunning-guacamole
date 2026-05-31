import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCollectorEfficiencyQuery } from '@/donation/application/query/get-collector-efficiency.query';
import { CollectorEfficiencyQueryService } from '@/donation/infrastructure/service/collector-efficiency.query.service';
import { CollectorEfficiencyResponseDto } from '@/donation/application/dto/collector-efficiency.response.dto';

@QueryHandler(GetCollectorEfficiencyQuery)
export class GetCollectorEfficiencyHandler
  implements IQueryHandler<GetCollectorEfficiencyQuery>
{
  constructor(
    private readonly efficiencyService: CollectorEfficiencyQueryService,
  ) {}

  async execute(
    query: GetCollectorEfficiencyQuery,
  ): Promise<CollectorEfficiencyResponseDto> {
    return this.efficiencyService.getEfficiency(query.collectorId);
  }
}
