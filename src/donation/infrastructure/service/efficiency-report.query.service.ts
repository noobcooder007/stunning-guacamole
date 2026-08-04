import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
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
    // Nota: el filtro promiseAmount BETWEEN compara montos de distinta moneda
    // en el mismo rango numérico (bug de filtrado conocido, fuera de alcance
    // de esta corrección — ver auditoría de manejo de monedas).
    const qb = this.dataSource
      .createQueryBuilder()
      .select('c.id', 'collectorId')
      .addSelect('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .addSelect(
        `SUM(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
        'assignedAmountMxn',
      )
      .addSelect(
        `SUM(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
        'assignedAmountUsd',
      )
      .addSelect(
        this.consolidatedMxnCase(`r.status != 'CANCELLED'`),
        'assignedAmountConsolidatedMxn',
      )
      .addSelect(
        this.hasUnconvertedUsdCase(`r.status != 'CANCELLED'`),
        'assignedHasUnconvertedUsd',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status != 'CANCELLED' THEN 1 END)`,
        'assignedCount',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'PAID' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
        'collectedAmountMxn',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'PAID' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
        'collectedAmountUsd',
      )
      .addSelect(
        this.consolidatedMxnCase(`r.status = 'PAID'`),
        'collectedAmountConsolidatedMxn',
      )
      .addSelect(
        this.hasUnconvertedUsdCase(`r.status = 'PAID'`),
        'collectedHasUnconvertedUsd',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status = 'PAID' THEN 1 END)`,
        'collectedCount',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'PENDING' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
        'pendingAmountMxn',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'PENDING' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
        'pendingAmountUsd',
      )
      .addSelect(
        this.consolidatedMxnCase(`r.status = 'PENDING'`),
        'pendingAmountConsolidatedMxn',
      )
      .addSelect(
        this.hasUnconvertedUsdCase(`r.status = 'PENDING'`),
        'pendingHasUnconvertedUsd',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END)`,
        'pendingCount',
      )
      .from(ReceiptSchema, 'r')
      .innerJoin(PromiseDonationSchema, 'pd', 'pd.id = r."promiseDonationId"')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
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

  private consolidatedMxnCase(statusCondition: string): string {
    return `SUM(CASE
      WHEN ${statusCondition} AND r.currency = 'MXN' THEN r.amount
      WHEN ${statusCondition} AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NOT NULL THEN r.amount * cp."exchangeRateUsdToMxn"
      ELSE 0
    END)`;
  }

  // SUM() ignora los NULL en vez de propagarlos: este flag detecta si hubo
  // algún USD sin tipo de cambio para forzar el consolidado a null en JS.
  private hasUnconvertedUsdCase(statusCondition: string): string {
    return `MAX(CASE WHEN ${statusCondition} AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NULL THEN 1 ELSE 0 END)`;
  }

  private toRow(r: any): EfficiencyReportRowDto {
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

  private calcRate(
    collected: number | null,
    assigned: number | null,
  ): number | null {
    if (collected === null || assigned === null) return null;
    if (!assigned) return 0;
    return Math.round((collected / assigned) * 10000) / 100;
  }

  private sumTotals(rows: EfficiencyReportRowDto[]): EfficiencyReportTotalsDto {
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
      } as EfficiencyReportTotalsDto,
    );
    totals.collectionRate = this.calcRate(
      totals.collectedAmountConsolidatedMxn,
      totals.assignedAmountConsolidatedMxn,
    );
    return totals;
  }
}
