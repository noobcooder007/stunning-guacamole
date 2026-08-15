import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBeneficientsByCollectorReportQuery } from '@/donation/application/query/get-beneficients-by-collector-report.query';
import { BeneficientsByCollectorReportQueryService } from '@/donation/infrastructure/service/beneficients-by-collector-report.query.service';
import { BeneficientsByCollectorReportResponseDto } from '@/donation/application/dto/beneficients-by-collector-report.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetBeneficientsByCollectorReportQuery)
export class GetBeneficientsByCollectorReportHandler implements IQueryHandler<
  GetBeneficientsByCollectorReportQuery,
  Result<BeneficientsByCollectorReportResponseDto>
> {
  constructor(
    private readonly reportService: BeneficientsByCollectorReportQueryService,
  ) {}

  async execute(
    query: GetBeneficientsByCollectorReportQuery,
  ): Promise<Result<BeneficientsByCollectorReportResponseDto>> {
    const data = await this.reportService.getReport(
      query.fromMonth,
      query.fromYear,
      query.toMonth,
      query.toYear,
      query.includeSpecial,
      query.collectorNumber,
    );
    return Result.ok(data);
  }
}
