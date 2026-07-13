import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import {
  EfficiencyReportResponseDto,
  EfficiencyReportRowDto,
  EfficiencyReportTotalsDto,
} from '@/donation/application/dto/efficiency-report.response.dto';

export interface EfficiencyReportParams {
  month: number;
  year: number;
  initialDonation: number;
  finalDonation: number;
  frequency: number;
  collectorNum?: number;
}

@Injectable()
export class EfficiencyReportQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getReport(
    params: EfficiencyReportParams,
  ): Promise<EfficiencyReportResponseDto> {
    const rows = await this.queryRows(params);
    const collectors = rows.map((r) => this.toRow(r));
    return {
      month: params.month,
      year: params.year,
      initialDonation: params.initialDonation,
      finalDonation: params.finalDonation,
      frequency: params.frequency,
      collectorNum: params.collectorNum ?? null,
      collectors,
      totals: this.sumTotals(collectors),
    };
  }

  private async queryRows(params: EfficiencyReportParams): Promise<any[]> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .addSelect(
        `SUM(CASE WHEN r.status != 'CANCELLED' THEN r.amount ELSE 0 END)`,
        'assignedAmount',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status != 'CANCELLED' THEN 1 END)`,
        'assignedCount',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'PAID' THEN r.amount ELSE 0 END)`,
        'collectedAmount',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status = 'PAID' THEN 1 END)`,
        'collectedCount',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'PENDING' THEN r.amount ELSE 0 END)`,
        'pendingAmount',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END)`,
        'pendingCount',
      )
      .from(ReceiptSchema, 'r')
      .innerJoin(PromiseDonationSchema, 'pd', 'pd.id = r."promiseDonationId"')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
      .where('r."periodMonth" = :month', { month: params.month })
      .andWhere('r."periodYear" = :year', { year: params.year })
      .andWhere(
        'pd."promiseAmount" BETWEEN :initialDonation AND :finalDonation',
        {
          initialDonation: params.initialDonation,
          finalDonation: params.finalDonation,
        },
      )
      .andWhere('pd.recurrence = :frequency', {
        frequency: params.frequency,
      });

    if (params.collectorNum !== undefined && params.collectorNum !== null) {
      qb.andWhere('c."collectorNumber" = :collectorNum', {
        collectorNum: params.collectorNum,
      });
    }

    return qb
      .groupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private toRow(r: any): EfficiencyReportRowDto {
    const assigned = Number(r.assignedAmount ?? 0);
    const collected = Number(r.collectedAmount ?? 0);
    return {
      collectorId: r.collectorId,
      collectorNumber: Number(r.collectorNumber),
      collectorName: [r.firstname, r.firstLastname, r.secondLastname]
        .filter(Boolean)
        .join(' '),
      assignedAmount: assigned,
      assignedCount: Number(r.assignedCount ?? 0),
      collectedAmount: collected,
      collectedCount: Number(r.collectedCount ?? 0),
      pendingAmount: Number(r.pendingAmount ?? 0),
      pendingCount: Number(r.pendingCount ?? 0),
      collectionRate: this.calcRate(collected, assigned),
    };
  }

  private calcRate(collected: number, assigned: number): number {
    if (!assigned || assigned === 0) return 0;
    return Math.round((collected / assigned) * 10000) / 100;
  }

  private sumTotals(rows: EfficiencyReportRowDto[]): EfficiencyReportTotalsDto {
    const totals = rows.reduce(
      (acc, row) => {
        acc.assignedAmount += row.assignedAmount;
        acc.assignedCount += row.assignedCount;
        acc.collectedAmount += row.collectedAmount;
        acc.collectedCount += row.collectedCount;
        acc.pendingAmount += row.pendingAmount;
        acc.pendingCount += row.pendingCount;
        return acc;
      },
      {
        assignedAmount: 0,
        assignedCount: 0,
        collectedAmount: 0,
        collectedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
      },
    );
    return {
      ...totals,
      collectionRate: this.calcRate(
        totals.collectedAmount,
        totals.assignedAmount,
      ),
    };
  }
}
