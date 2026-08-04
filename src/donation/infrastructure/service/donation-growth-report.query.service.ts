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
      receiptsVariationMxn: calcVariation(
        current.totalReceiptsMxn,
        prior.totalReceiptsMxn,
      ),
      receiptsVariationUsd: calcVariation(
        current.totalReceiptsUsd,
        prior.totalReceiptsUsd,
      ),
      promiseAmountVariationMxn: calcVariation(
        current.newPromiseAmountMxn,
        prior.newPromiseAmountMxn,
      ),
      promiseAmountVariationUsd: calcVariation(
        current.newPromiseAmountUsd,
        prior.newPromiseAmountUsd,
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
      totalReceiptsMxn: receiptsReport.totalAccumulatedAmountMxn,
      totalReceiptsUsd: receiptsReport.totalAccumulatedAmountUsd,
      totalReceiptsConsolidatedMxn:
        receiptsReport.totalAccumulatedAmountConsolidatedMxn,
      newPromiseAmountMxn: newPromiseAmount.mxn,
      newPromiseAmountUsd: newPromiseAmount.usd,
    };
  }

  // promise_donations no está ligado a un período de cobro (son compromisos
  // recurrentes, no transacciones puntuales), así que no hay tipo de cambio
  // de referencia para consolidar USD->MXN aquí; se reporta el desglose crudo.
  private async getNewPromiseAmount(
    month: number,
    year: number,
  ): Promise<{ mxn: number; usd: number }> {
    const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const to = new Date(year, month, 1, 0, 0, 0, 0);

    const { mxn, usd } = await this.dataSource
      .createQueryBuilder()
      .select(
        `SUM(CASE WHEN p.currency = 'MXN' THEN p."promiseAmount" ELSE 0 END)`,
        'mxn',
      )
      .addSelect(
        `SUM(CASE WHEN p.currency = 'USD' THEN p."promiseAmount" ELSE 0 END)`,
        'usd',
      )
      .from(PromiseDonationSchema, 'p')
      .where('p."createdAt" >= :from', { from })
      .andWhere('p."createdAt" < :to', { to })
      .getRawOne();

    return { mxn: Number(mxn ?? 0), usd: Number(usd ?? 0) };
  }
}
