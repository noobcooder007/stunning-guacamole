import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { EfficiencyType } from '@/donation/domain/constants/efficiency-type.enum';
import {
  EfficiencyConcentratedReportResponseDto,
  EfficiencyConcentratedRowDto,
} from '@/donation/application/dto/efficiency-concentrated-report.response.dto';

const MONTH_LABELS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

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

export interface EfficiencyConcentratedReportParams {
  startDate: string;
  endDate: string;
  initialPercentage: number;
  finalPercentage: number;
  efficiencyType: EfficiencyType;
  collectorNum?: number;
}

@Injectable()
export class EfficiencyConcentratedReportQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getReport(
    params: EfficiencyConcentratedReportParams,
  ): Promise<EfficiencyConcentratedReportResponseDto> {
    const rawRows = await this.queryRows(params);
    // Filas sin tipo de cambio determinable (periodo abierto con USD) no
    // tienen una eficiencia calculable en MXN y se excluyen del filtro.
    const rows = rawRows
      .map((r) => this.toRow(r, params.efficiencyType))
      .filter(
        (r) =>
          r.collectionRate !== null &&
          r.collectionRate >= params.initialPercentage &&
          r.collectionRate <= params.finalPercentage,
      );

    return {
      startDate: params.startDate,
      endDate: params.endDate,
      initialPercentage: params.initialPercentage,
      finalPercentage: params.finalPercentage,
      efficiencyType: params.efficiencyType,
      collectorNum: params.collectorNum ?? null,
      rows,
    };
  }

  private baseQuery(params: EfficiencyConcentratedReportParams) {
    const qb = this.dataSource
      .createQueryBuilder()
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
      .where('r."createdAt" >= :startDate', { startDate: params.startDate })
      .andWhere('r."createdAt" <= :endDate', { endDate: params.endDate });

    if (params.collectorNum !== undefined && params.collectorNum !== null) {
      qb.andWhere('c."collectorNumber" = :collectorNum', {
        collectorNum: params.collectorNum,
      });
    }

    for (const [expr, alias] of RECEIPT_AGGREGATE_SELECTS) {
      qb.addSelect(expr, alias);
    }
    return qb;
  }

  private async queryRows(
    params: EfficiencyConcentratedReportParams,
  ): Promise<any[]> {
    switch (params.efficiencyType) {
      case EfficiencyType.PERIOD:
        return this.queryByPeriod(params);
      case EfficiencyType.YEAR:
        return this.queryByYear(params);
      case EfficiencyType.HISTORICAL:
      default:
        return this.queryHistorical(params);
    }
  }

  private async queryByPeriod(
    params: EfficiencyConcentratedReportParams,
  ): Promise<any[]> {
    return this.baseQuery(params)
      .addSelect('cp.month', 'month')
      .addSelect('cp.year', 'year')
      .addSelect('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .innerJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .groupBy('cp.id')
      .addGroupBy('cp.month')
      .addGroupBy('cp.year')
      .addGroupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private async queryByYear(
    params: EfficiencyConcentratedReportParams,
  ): Promise<any[]> {
    return this.baseQuery(params)
      .addSelect('r."periodYear"', 'year')
      .addSelect('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .andWhere('r."periodYear" IS NOT NULL')
      .groupBy('r."periodYear"')
      .addGroupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private async queryHistorical(
    params: EfficiencyConcentratedReportParams,
  ): Promise<any[]> {
    return this.baseQuery(params)
      .addSelect('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
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

  private groupLabel(r: any, efficiencyType: EfficiencyType): string {
    if (efficiencyType === EfficiencyType.PERIOD) {
      return `${MONTH_LABELS[Number(r.month) - 1]} ${r.year}`;
    }
    if (efficiencyType === EfficiencyType.YEAR) {
      return String(r.year);
    }
    return 'HISTÓRICO';
  }

  private toRow(
    r: any,
    efficiencyType: EfficiencyType,
  ): EfficiencyConcentratedRowDto {
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
      collectorId: r.collectorId,
      collectorNumber: Number(r.collectorNumber),
      collectorName: [r.firstname, r.firstLastname, r.secondLastname]
        .filter(Boolean)
        .join(' '),
      groupLabel: this.groupLabel(r, efficiencyType),
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
}
