import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { GetCurrentPeriodQuery } from '@/donation/application/query/get-current-period.query';
import { PeriodResponseDto } from '@/donation/application/dto/period.response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { Repository } from 'typeorm';

@QueryHandler(GetCurrentPeriodQuery)
export class GetCurrentPeriodHandler
  implements IQueryHandler<GetCurrentPeriodQuery>
{
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @InjectRepository(ReceiptSchema)
    private readonly receiptRepo: Repository<ReceiptSchema>,
  ) {}

  async execute(): Promise<PeriodResponseDto | null> {
    const period = await this.periodRepository.findOpen();
    if (!period) return null;

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
    return response;
  }
}
