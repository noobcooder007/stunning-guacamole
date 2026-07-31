import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { GetLastClosedPeriodQuery } from '@/donation/application/query/get-last-closed-period.query';
import { PeriodResponseDto } from '@/donation/application/dto/period.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetLastClosedPeriodQuery)
export class GetLastClosedPeriodHandler extends BaseQueryHandler<
  GetLastClosedPeriodQuery,
  PeriodResponseDto | null
> {
  constructor(
    public readonly datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
  ) {
    super(datasource);
  }

  protected async handle(): Promise<Result<PeriodResponseDto | null>> {
    const period = await this.periodRepository.findLastClosed();
    if (!period) return Result.ok(null);

    const response = new PeriodResponseDto();
    response.id = period._id.unpack();
    response.month = period.month;
    response.year = period.year;
    response.status = period.status;
    response.closedAt = period.closedAt;
    response.closedBy = period.closedBy?.unpack();
    response.createdAt = period.createdAt;
    response.createdBy = period.createdBy.unpack();
    return Result.ok(response);
  }
}
