import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDonationGrowthReportQuery } from '@/donation/application/query/get-donation-growth-report.query';
import { DonationGrowthReportQueryService } from '@/donation/infrastructure/service/donation-growth-report.query.service';
import { DonationGrowthReportResponseDto } from '@/donation/application/dto/donation-growth-report.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetDonationGrowthReportQuery)
export class GetDonationGrowthReportHandler implements IQueryHandler<
  GetDonationGrowthReportQuery,
  Result<DonationGrowthReportResponseDto>
> {
  constructor(
    private readonly reportService: DonationGrowthReportQueryService,
  ) {}

  async execute(
    query: GetDonationGrowthReportQuery,
  ): Promise<Result<DonationGrowthReportResponseDto>> {
    const data = await this.reportService.getReport(query.month, query.year);
    return Result.ok(data);
  }
}
