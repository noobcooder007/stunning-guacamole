import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import {
  CollectorEfficiencyRowDto,
  ConsolidatedCollectorEfficiencyResponseDto,
  ConsolidatedPeriodEfficiencyDto,
  ConsolidatedYearEfficiencyDto,
} from '@/donation/application/dto/consolidated-collector-efficiency.response.dto';
import { HistoricalEfficiencyDto } from '@/donation/application/dto/collector-efficiency.response.dto';

const RECEIPT_AGGREGATE_SELECTS = [
  [
    `SUM(CASE WHEN r.status != 'CANCELLED' THEN r.amount ELSE 0 END)`,
    'assignedAmount',
  ],
  [`COUNT(CASE WHEN r.status != 'CANCELLED' THEN 1 END)`, 'assignedCount'],
  [
    `SUM(CASE WHEN r.status = 'PAID' THEN r.amount ELSE 0 END)`,
    'collectedAmount',
  ],
  [`COUNT(CASE WHEN r.status = 'PAID' THEN 1 END)`, 'collectedCount'],
  [
    `SUM(CASE WHEN r.status = 'PENDING' THEN r.amount ELSE 0 END)`,
    'pendingAmount',
  ],
  [`COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END)`, 'pendingCount'],
] as const;

@Injectable()
export class ConsolidatedCollectorEfficiencyQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getConsolidatedEfficiency(): Promise<ConsolidatedCollectorEfficiencyResponseDto> {
    const [byPeriodRaw, byYearRaw, historicalRaw] = await Promise.all([
      this.queryByPeriod(),
      this.queryByYear(),
      this.queryHistorical(),
    ]);

    return {
      byPeriod: this.groupByPeriod(byPeriodRaw),
      byYear: this.groupByYear(byYearRaw),
      historical: this.groupHistorical(historicalRaw),
    };
  }

  private baseQuery() {
    const qb = this.dataSource
      .createQueryBuilder()
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"');
    for (const [expr, alias] of RECEIPT_AGGREGATE_SELECTS) {
      qb.addSelect(expr, alias);
    }
    return qb;
  }

  private async queryByPeriod(): Promise<any[]> {
    return this.baseQuery()
      .select('cp.id', 'periodId')
      .addSelect('cp.month', 'month')
      .addSelect('cp.year', 'year')
      .addSelect('cp.status', 'periodStatus')
      .addSelect('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .innerJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .groupBy('cp.id')
      .addGroupBy('cp.month')
      .addGroupBy('cp.year')
      .addGroupBy('cp.status')
      .addGroupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('cp.year', 'DESC')
      .addOrderBy('cp.month', 'DESC')
      .addOrderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private async queryByYear(): Promise<any[]> {
    return this.baseQuery()
      .select('r."periodYear"', 'year')
      .addSelect('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .where('r."periodYear" IS NOT NULL')
      .groupBy('r."periodYear"')
      .addGroupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('r."periodYear"', 'DESC')
      .addOrderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private async queryHistorical(): Promise<any[]> {
    return this.baseQuery()
      .select('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .groupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private calcRate(collected: number, assigned: number): number {
    if (!assigned || assigned === 0) return 0;
    return Math.round((collected / assigned) * 10000) / 100;
  }

  private toRow(r: any): CollectorEfficiencyRowDto {
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

  private sumTotals(
    rows: CollectorEfficiencyRowDto[],
  ): HistoricalEfficiencyDto {
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

  private groupByPeriod(rows: any[]): ConsolidatedPeriodEfficiencyDto[] {
    const periods = new Map<string, ConsolidatedPeriodEfficiencyDto>();
    for (const r of rows) {
      const periodId = r.periodId;
      if (!periods.has(periodId)) {
        periods.set(periodId, {
          periodId,
          month: Number(r.month),
          year: Number(r.year),
          periodStatus: r.periodStatus,
          collectors: [],
          totals: null,
        });
      }
      periods.get(periodId).collectors.push(this.toRow(r));
    }
    return Array.from(periods.values()).map((p) => ({
      ...p,
      totals: this.sumTotals(p.collectors),
    }));
  }

  private groupByYear(rows: any[]): ConsolidatedYearEfficiencyDto[] {
    const years = new Map<number, ConsolidatedYearEfficiencyDto>();
    for (const r of rows) {
      const year = Number(r.year);
      if (!years.has(year)) {
        years.set(year, { year, collectors: [], totals: null });
      }
      years.get(year).collectors.push(this.toRow(r));
    }
    return Array.from(years.values()).map((y) => ({
      ...y,
      totals: this.sumTotals(y.collectors),
    }));
  }

  private groupHistorical(
    rows: any[],
  ): ConsolidatedCollectorEfficiencyResponseDto['historical'] {
    const collectors = rows.map((r) => this.toRow(r));
    return { collectors, totals: this.sumTotals(collectors) };
  }
}
