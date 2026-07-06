import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { ReceiptsReportQueryService } from '@/donation/infrastructure/service/receipts-report.query.service';
import {
  DonationGrowthReportResponseDto,
  PeriodTotalsDto,
  VariationDto,
} from '@/donation/application/dto/donation-growth-report.response.dto';

function previousMonthYear(
  month: number,
  year: number,
): { month: number; year: number } {
  return month === 1
    ? { month: 12, year: year - 1 }
    : { month: month - 1, year };
}

function calcVariation(current: number, previous: number): VariationDto {
  const amount = current - previous;
  const percentage =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Math.round((amount / previous) * 10000) / 100;
  return { amount, percentage };
}

@Injectable()
export class DonationGrowthReportQueryService extends BaseQueryService {
  constructor(
    dataSource: DataSource,
    private readonly receiptsReportService: ReceiptsReportQueryService,
  ) {
    super(dataSource);
  }

  async getReport(
    month: number,
    year: number,
  ): Promise<DonationGrowthReportResponseDto> {
    const previous = previousMonthYear(month, year);

    const [current, prior] = await Promise.all([
      this.getPeriodTotals(month, year),
      this.getPeriodTotals(previous.month, previous.year),
    ]);

    return {
      currentPeriod: current,
      previousPeriod: prior,
      receiptsVariation: calcVariation(
        current.totalReceipts,
        prior.totalReceipts,
      ),
      promiseAmountVariation: calcVariation(
        current.newPromiseAmount,
        prior.newPromiseAmount,
      ),
    };
  }

  private async getPeriodTotals(
    month: number,
    year: number,
  ): Promise<PeriodTotalsDto> {
    const [receiptsReport, newPromiseAmount] = await Promise.all([
      this.receiptsReportService.getReportByPeriod(month, year),
      this.getNewPromiseAmount(month, year),
    ]);

    return {
      month,
      year,
      totalReceipts: receiptsReport.totalAccumulatedAmount,
      newPromiseAmount,
    };
  }

  private async getNewPromiseAmount(
    month: number,
    year: number,
  ): Promise<number> {
    const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const to = new Date(year, month, 1, 0, 0, 0, 0);

    const { total } = await this.dataSource
      .createQueryBuilder()
      .select('SUM(p."promiseAmount")', 'total')
      .from(PromiseDonationSchema, 'p')
      .where('p."createdAt" >= :from', { from })
      .andWhere('p."createdAt" < :to', { to })
      .getRawOne();

    return Number(total ?? 0);
  }
}
