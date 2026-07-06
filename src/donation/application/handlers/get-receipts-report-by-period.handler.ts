import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReceiptsReportByPeriodQuery } from '@/donation/application/query/get-receipts-report-by-period.query';
import { ReceiptsReportQueryService } from '@/donation/infrastructure/service/receipts-report.query.service';
import { ReceiptsReportByPeriodResponseDto } from '@/donation/application/dto/receipts-report-by-period.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetReceiptsReportByPeriodQuery)
export class GetReceiptsReportByPeriodHandler implements IQueryHandler<
  GetReceiptsReportByPeriodQuery,
  Result<ReceiptsReportByPeriodResponseDto>
> {
  constructor(private readonly reportService: ReceiptsReportQueryService) {}

  async execute(
    query: GetReceiptsReportByPeriodQuery,
  ): Promise<Result<ReceiptsReportByPeriodResponseDto>> {
    const data = await this.reportService.getReportByPeriod(
      query.month,
      query.year,
    );
    return Result.ok(data);
  }
}
