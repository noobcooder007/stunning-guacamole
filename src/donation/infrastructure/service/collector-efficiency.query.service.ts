import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import {
  AmountBreakdownDto,
  CollectorEfficiencyResponseDto,
} from '@/donation/application/dto/collector-efficiency.response.dto';

@Injectable()
export class CollectorEfficiencyQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getEfficiency(
    collectorId: string,
  ): Promise<CollectorEfficiencyResponseDto> {
    const [byPeriodRaw, byYearRaw, historicalRaw] = await Promise.all([
      this.queryByPeriod(collectorId),
      this.queryByYear(collectorId),
      this.queryHistorical(collectorId),
    ]);

    return {
      collectorId,
      byPeriod: byPeriodRaw.map((r) => ({
        periodId: r.periodId,
        month: Number(r.month),
        year: Number(r.year),
        periodStatus: r.periodStatus,
        ...this.mapAmountBreakdown(r),
      })),
      byYear: byYearRaw.map((r) => ({
        year: Number(r.year),
        ...this.mapAmountBreakdown(r),
      })),
      historical: this.mapAmountBreakdown(historicalRaw),
    };
  }

  private addAmountSelects(qb: any) {
    return qb
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
      );
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

  private async queryByPeriod(collectorId: string): Promise<any[]> {
    let qb = this.dataSource
      .createQueryBuilder()
      .select('cp.id', 'periodId')
      .addSelect('cp.month', 'month')
      .addSelect('cp.year', 'year')
      .addSelect('cp.status', 'periodStatus');
    qb = this.addAmountSelects(qb);
    return qb
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .where('r."collectorId" = :collectorId', { collectorId })
      .groupBy('cp.id')
      .addGroupBy('cp.month')
      .addGroupBy('cp.year')
      .addGroupBy('cp.status')
      .orderBy('cp.year', 'DESC')
      .addOrderBy('cp.month', 'DESC')
      .getRawMany();
  }

  private async queryByYear(collectorId: string): Promise<any[]> {
    let qb = this.dataSource
      .createQueryBuilder()
      .select('r."periodYear"', 'year');
    qb = this.addAmountSelects(qb);
    return qb
      .from(ReceiptSchema, 'r')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .where('r."collectorId" = :collectorId', { collectorId })
      .andWhere('r."periodYear" IS NOT NULL')
      .groupBy('r."periodYear"')
      .orderBy('r."periodYear"', 'DESC')
      .getRawMany();
  }

  private async queryHistorical(collectorId: string): Promise<any> {
    let qb = this.dataSource.createQueryBuilder().select('1', 'dummy');
    qb = this.addAmountSelects(qb);
    return qb
      .from(ReceiptSchema, 'r')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .where('r."collectorId" = :collectorId', { collectorId })
      .getRawOne();
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
    const assignedConsolidatedMxn = Number(r?.assignedHasUnconvertedUsd)
      ? null
      : Number(r?.assignedAmountConsolidatedMxn ?? 0);
    const collectedConsolidatedMxn = Number(r?.collectedHasUnconvertedUsd)
      ? null
      : Number(r?.collectedAmountConsolidatedMxn ?? 0);
    const pendingConsolidatedMxn = Number(r?.pendingHasUnconvertedUsd)
      ? null
      : Number(r?.pendingAmountConsolidatedMxn ?? 0);
    return {
      assignedAmountMxn: Number(r?.assignedAmountMxn ?? 0),
      assignedAmountUsd: Number(r?.assignedAmountUsd ?? 0),
      assignedAmountConsolidatedMxn: assignedConsolidatedMxn,
      assignedCount: Number(r?.assignedCount ?? 0),
      collectedAmountMxn: Number(r?.collectedAmountMxn ?? 0),
      collectedAmountUsd: Number(r?.collectedAmountUsd ?? 0),
      collectedAmountConsolidatedMxn: collectedConsolidatedMxn,
      collectedCount: Number(r?.collectedCount ?? 0),
      pendingAmountMxn: Number(r?.pendingAmountMxn ?? 0),
      pendingAmountUsd: Number(r?.pendingAmountUsd ?? 0),
      pendingAmountConsolidatedMxn: pendingConsolidatedMxn,
      pendingCount: Number(r?.pendingCount ?? 0),
      collectionRate: this.calcRate(
        collectedConsolidatedMxn,
        assignedConsolidatedMxn,
      ),
    };
  }
}
