import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICollectorSettlementRepository } from '@/donation/domain/repositories/collector-settlement.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { GetPeriodSettlementsQuery } from '@/donation/application/query/get-period-settlements.query';
import { SettlementResponseDto } from '@/donation/application/dto/settlement.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetPeriodSettlementsQuery)
export class GetPeriodSettlementsHandler
  implements IQueryHandler<GetPeriodSettlementsQuery, Result<SettlementResponseDto[]>>
{
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR_SETTLEMENT)
    private readonly settlementRepository: ICollectorSettlementRepository,
  ) {}

  async execute(query: GetPeriodSettlementsQuery): Promise<Result<SettlementResponseDto[]>> {
    const settlements = await this.settlementRepository.findByPeriodId(
      query.periodId,
    );
    return Result.ok(
      settlements.map((s) => ({
        id: s._id.unpack(),
        collectionPeriodId: s.collectionPeriodId,
        collectorId: s.collectorId.unpack(),
        month: s.month,
        year: s.year,
        totalCollected: s.totalCollected,
        commissionPercent: s.commissionPercent,
        commissionAmount: s.commissionAmount,
        createdAt: s.createdAt,
      })),
    );
  }
}
