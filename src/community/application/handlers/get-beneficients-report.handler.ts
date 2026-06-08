import { DataSource } from 'typeorm';
import { QueryHandler } from '@nestjs/cqrs';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { GetBeneficientsReportQuery } from '@/community/application/query/get-beneficients-report.query';
import { BeneficientsReportItemDto } from '@/community/application/dto/beneficients-report.response';
import { BeneficientsReportQueryService } from '@/community/infrastructure/service/beneficients-report.query.service';

@QueryHandler(GetBeneficientsReportQuery)
export class GetBeneficientsReportHandler extends BaseQueryHandler<
  GetBeneficientsReportQuery,
  Paginated<BeneficientsReportItemDto>
> {
  constructor(
    public readonly datasource: DataSource,
    private readonly reportService: BeneficientsReportQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetBeneficientsReportQuery,
  ): Promise<Result<Paginated<BeneficientsReportItemDto>, IErrorResult>> {
    const result = await this.reportService.getReport(query.page, query.limit);
    return Result.ok(result);
  }
}
