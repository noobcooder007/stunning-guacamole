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
import {
  AmountBreakdownDto,
  HistoricalEfficiencyDto,
} from '@/donation/application/dto/collector-efficiency.response.dto';

function consolidatedMxnCase(statusCondition: string): string {
  return `SUM(CASE
    WHEN ${statusCondition} AND r.currency = 'MXN' THEN r.amount
    WHEN ${statusCondition} AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NOT NULL THEN r.amount * cp."exchangeRateUsdToMxn"
    ELSE 0
  END)`;
}

// SUM() ignora los NULL en vez de propagarlos: este flag detecta si hubo
// algún USD sin tipo de cambio para forzar el consolidado a null en JS.
function hasUnconvertedUsdCase(statusCondition: string): string {
  return `MAX(CASE WHEN ${statusCondition} AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NULL THEN 1 ELSE 0 END)`;
}

const RECEIPT_AGGREGATE_SELECTS: [string, string][] = [
  [
    `SUM(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
    'assignedAmountMxn',
  ],
  [
    `SUM(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
    'assignedAmountUsd',
  ],
  [
    consolidatedMxnCase(`r.status != 'CANCELLED'`),
    'assignedAmountConsolidatedMxn',
  ],
  [
    hasUnconvertedUsdCase(`r.status != 'CANCELLED'`),
    'assignedHasUnconvertedUsd',
  ],
  [`COUNT(CASE WHEN r.status != 'CANCELLED' THEN 1 END)`, 'assignedCount'],
  [
    `SUM(CASE WHEN r.status = 'PAID' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
    'collectedAmountMxn',
  ],
  [
    `SUM(CASE WHEN r.status = 'PAID' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
    'collectedAmountUsd',
  ],
  [consolidatedMxnCase(`r.status = 'PAID'`), 'collectedAmountConsolidatedMxn'],
  [hasUnconvertedUsdCase(`r.status = 'PAID'`), 'collectedHasUnconvertedUsd'],
  [`COUNT(CASE WHEN r.status = 'PAID' THEN 1 END)`, 'collectedCount'],
  [
    `SUM(CASE WHEN r.status = 'PENDING' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
    'pendingAmountMxn',
  ],
  [
    `SUM(CASE WHEN r.status = 'PENDING' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
    'pendingAmountUsd',
  ],
  [consolidatedMxnCase(`r.status = 'PENDING'`), 'pendingAmountConsolidatedMxn'],
  [hasUnconvertedUsdCase(`r.status = 'PENDING'`), 'pendingHasUnconvertedUsd'],
  [`COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END)`, 'pendingCount'],
];

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
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"');
    for (const [expr, alias] of RECEIPT_AGGREGATE_SELECTS) {
      qb.addSelect(expr, alias);
    }
    return qb;
  }

  private async queryByPeriod(): Promise<any[]> {
    return this.baseQuery()
      .addSelect('cp.id', 'periodId')
      .addSelect('cp.month', 'month')
      .addSelect('cp.year', 'year')
      .addSelect('cp.status', 'periodStatus')
      .addSelect('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .where('r."collectionPeriodId" IS NOT NULL')
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
      .addSelect('r."periodYear"', 'year')
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
      .addSelect('c.id', 'collectorId')
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

  private calcRate(
    collected: number | null,
    assigned: number | null,
  ): number | null {
    if (collected === null || assigned === null) return null;
    if (!assigned) return 0;
    return Math.round((collected / assigned) * 10000) / 100;
  }

  private mapAmountBreakdown(r: any): AmountBreakdownDto {
    const assignedConsolidatedMxn = Number(r.assignedHasUnconvertedUsd)
      ? null
      : Number(r.assignedAmountConsolidatedMxn ?? 0);
    const collectedConsolidatedMxn = Number(r.collectedHasUnconvertedUsd)
      ? null
      : Number(r.collectedAmountConsolidatedMxn ?? 0);
    const pendingConsolidatedMxn = Number(r.pendingHasUnconvertedUsd)
      ? null
      : Number(r.pendingAmountConsolidatedMxn ?? 0);
    return {
      assignedAmountMxn: Number(r.assignedAmountMxn ?? 0),
      assignedAmountUsd: Number(r.assignedAmountUsd ?? 0),
      assignedAmountConsolidatedMxn: assignedConsolidatedMxn,
      assignedCount: Number(r.assignedCount ?? 0),
      collectedAmountMxn: Number(r.collectedAmountMxn ?? 0),
      collectedAmountUsd: Number(r.collectedAmountUsd ?? 0),
      collectedAmountConsolidatedMxn: collectedConsolidatedMxn,
      collectedCount: Number(r.collectedCount ?? 0),
      pendingAmountMxn: Number(r.pendingAmountMxn ?? 0),
      pendingAmountUsd: Number(r.pendingAmountUsd ?? 0),
      pendingAmountConsolidatedMxn: pendingConsolidatedMxn,
      pendingCount: Number(r.pendingCount ?? 0),
      collectionRate: this.calcRate(
        collectedConsolidatedMxn,
        assignedConsolidatedMxn,
      ),
    };
  }

  private toRow(r: any): CollectorEfficiencyRowDto {
    return {
      collectorId: r.collectorId,
      collectorNumber: Number(r.collectorNumber),
      collectorName: [r.firstname, r.firstLastname, r.secondLastname]
        .filter(Boolean)
        .join(' '),
      ...this.mapAmountBreakdown(r),
    };
  }

  private sumTotals(
    rows: CollectorEfficiencyRowDto[],
  ): HistoricalEfficiencyDto {
    const hasNullAssigned = rows.some(
      (r) => r.assignedAmountConsolidatedMxn === null,
    );
    const hasNullCollected = rows.some(
      (r) => r.collectedAmountConsolidatedMxn === null,
    );
    const hasNullPending = rows.some(
      (r) => r.pendingAmountConsolidatedMxn === null,
    );
    const totals = rows.reduce(
      (acc, row) => {
        acc.assignedAmountMxn += row.assignedAmountMxn;
        acc.assignedAmountUsd += row.assignedAmountUsd;
        acc.assignedCount += row.assignedCount;
        acc.collectedAmountMxn += row.collectedAmountMxn;
        acc.collectedAmountUsd += row.collectedAmountUsd;
        acc.collectedCount += row.collectedCount;
        acc.pendingAmountMxn += row.pendingAmountMxn;
        acc.pendingAmountUsd += row.pendingAmountUsd;
        acc.pendingCount += row.pendingCount;
        if (!hasNullAssigned) {
          acc.assignedAmountConsolidatedMxn +=
            row.assignedAmountConsolidatedMxn;
        }
        if (!hasNullCollected) {
          acc.collectedAmountConsolidatedMxn +=
            row.collectedAmountConsolidatedMxn;
        }
        if (!hasNullPending) {
          acc.pendingAmountConsolidatedMxn += row.pendingAmountConsolidatedMxn;
        }
        return acc;
      },
      {
        assignedAmountMxn: 0,
        assignedAmountUsd: 0,
        assignedAmountConsolidatedMxn: hasNullAssigned ? null : 0,
        assignedCount: 0,
        collectedAmountMxn: 0,
        collectedAmountUsd: 0,
        collectedAmountConsolidatedMxn: hasNullCollected ? null : 0,
        collectedCount: 0,
        pendingAmountMxn: 0,
        pendingAmountUsd: 0,
        pendingAmountConsolidatedMxn: hasNullPending ? null : 0,
        pendingCount: 0,
        collectionRate: null,
      } as HistoricalEfficiencyDto,
    );
    totals.collectionRate = this.calcRate(
      totals.collectedAmountConsolidatedMxn,
      totals.assignedAmountConsolidatedMxn,
    );
    return totals;
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
