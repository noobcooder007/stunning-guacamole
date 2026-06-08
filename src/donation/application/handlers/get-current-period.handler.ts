import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { GetCurrentPeriodQuery } from '@/donation/application/query/get-current-period.query';
import { PeriodResponseDto } from '@/donation/application/dto/period.response.dto';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetCurrentPeriodQuery)
export class GetCurrentPeriodHandler extends BaseQueryHandler<
  GetCurrentPeriodQuery,
  PeriodResponseDto | null
> {
  constructor(
    public readonly datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @InjectRepository(ReceiptSchema)
    private readonly receiptRepo: Repository<ReceiptSchema>,
  ) {
    super(datasource);
  }

  protected async handle(): Promise<Result<PeriodResponseDto | null>> {
    const period = await this.periodRepository.findOpen();
    if (!period) return Result.ok(null);

    const pendingReceiptsCount = await this.receiptRepo.count({
      where: {
        periodMonth: period.month,
        periodYear: period.year,
        status: 'PENDING',
      },
    });

    const response = new PeriodResponseDto();
    response.id = period._id.unpack();
    response.month = period.month;
    response.year = period.year;
    response.status = period.status;
    response.createdAt = period.createdAt;
    response.createdBy = period.createdBy.unpack();
    response.pendingReceiptsCount = pendingReceiptsCount;
    return Result.ok(response);
  }
}
