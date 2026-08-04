import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import {
  QuantityDifferenceReportResponseDto,
  QuantityDifferenceRowDto,
  QuantityDifferenceTotalsDto,
} from '@/donation/application/dto/quantity-difference-report.response.dto';

@Injectable()
export class QuantityDifferenceReportQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getReport(
    month: number,
    year: number,
  ): Promise<QuantityDifferenceReportResponseDto> {
    const rows = await this.queryByPeriod(month, year);
    const collectors = rows.map((r) => this.toRow(r));
    return {
      month,
      year,
      periodStatus: rows[0]?.periodStatus ?? null,
      collectors,
      totals: this.sumTotals(collectors),
    };
  }

  private async queryByPeriod(month: number, year: number): Promise<any[]> {
    return this.dataSource
      .createQueryBuilder()
      .select('cp.status', 'periodStatus')
      .addSelect('c.id', 'collectorId')
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
        `SUM(CASE
          WHEN r.status != 'CANCELLED' AND r.currency = 'MXN' THEN r.amount
          WHEN r.status != 'CANCELLED' AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NOT NULL THEN r.amount * cp."exchangeRateUsdToMxn"
          ELSE 0
        END)`,
        'assignedAmountConsolidatedMxn',
      )
      .addSelect(
        // SUM() ignora los NULL en vez de propagarlos: este flag detecta si
        // hubo algún USD sin tipo de cambio para forzar el consolidado a null.
        `MAX(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NULL THEN 1 ELSE 0 END)`,
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
        `SUM(CASE
          WHEN r.status = 'PAID' AND r.currency = 'MXN' THEN r.amount
          WHEN r.status = 'PAID' AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NOT NULL THEN r.amount * cp."exchangeRateUsdToMxn"
          ELSE 0
        END)`,
        'collectedAmountConsolidatedMxn',
      )
      .addSelect(
        `MAX(CASE WHEN r.status = 'PAID' AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NULL THEN 1 ELSE 0 END)`,
        'collectedHasUnconvertedUsd',
      )
      .addSelect(
        `COUNT(CASE WHEN r.status = 'PAID' THEN 1 END)`,
        'collectedCount',
      )
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
      .where('cp.month = :month', { month })
      .andWhere('cp.year = :year', { year })
      .groupBy('cp.status')
      .addGroupBy('c.id')
      .addGroupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('c."collectorNumber"', 'ASC')
      .getRawMany();
  }

  private toRow(r: any): QuantityDifferenceRowDto {
    const assignedMxn = Number(r.assignedAmountMxn ?? 0);
    const assignedUsd = Number(r.assignedAmountUsd ?? 0);
    const assignedConsolidatedMxn = Number(r.assignedHasUnconvertedUsd)
      ? null
      : Number(r.assignedAmountConsolidatedMxn ?? 0);
    const collectedMxn = Number(r.collectedAmountMxn ?? 0);
    const collectedUsd = Number(r.collectedAmountUsd ?? 0);
    const collectedConsolidatedMxn = Number(r.collectedHasUnconvertedUsd)
      ? null
      : Number(r.collectedAmountConsolidatedMxn ?? 0);
    return {
      collectorId: r.collectorId,
      collectorNumber: Number(r.collectorNumber),
      collectorName: [r.firstname, r.firstLastname, r.secondLastname]
        .filter(Boolean)
        .join(' '),
      assignedAmountMxn: assignedMxn,
      assignedAmountUsd: assignedUsd,
      assignedAmountConsolidatedMxn: assignedConsolidatedMxn,
      assignedCount: Number(r.assignedCount ?? 0),
      collectedAmountMxn: collectedMxn,
      collectedAmountUsd: collectedUsd,
      collectedAmountConsolidatedMxn: collectedConsolidatedMxn,
      collectedCount: Number(r.collectedCount ?? 0),
      differenceMxn: assignedMxn - collectedMxn,
      differenceUsd: assignedUsd - collectedUsd,
      differenceConsolidatedMxn:
        assignedConsolidatedMxn !== null && collectedConsolidatedMxn !== null
          ? assignedConsolidatedMxn - collectedConsolidatedMxn
          : null,
    };
  }

  private sumTotals(
    rows: QuantityDifferenceRowDto[],
  ): QuantityDifferenceTotalsDto {
    const hasNullAssigned = rows.some(
      (r) => r.assignedAmountConsolidatedMxn === null,
    );
    const hasNullCollected = rows.some(
      (r) => r.collectedAmountConsolidatedMxn === null,
    );
    const totals = rows.reduce(
      (acc, row) => {
        acc.assignedAmountMxn += row.assignedAmountMxn;
        acc.assignedAmountUsd += row.assignedAmountUsd;
        acc.assignedCount += row.assignedCount;
        acc.collectedAmountMxn += row.collectedAmountMxn;
        acc.collectedAmountUsd += row.collectedAmountUsd;
        acc.collectedCount += row.collectedCount;
        acc.differenceMxn += row.differenceMxn;
        acc.differenceUsd += row.differenceUsd;
        if (!hasNullAssigned) {
          acc.assignedAmountConsolidatedMxn +=
            row.assignedAmountConsolidatedMxn;
        }
        if (!hasNullCollected) {
          acc.collectedAmountConsolidatedMxn +=
            row.collectedAmountConsolidatedMxn;
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
        differenceMxn: 0,
        differenceUsd: 0,
        differenceConsolidatedMxn: null as number | null,
      } as QuantityDifferenceTotalsDto,
    );
    totals.differenceConsolidatedMxn =
      totals.assignedAmountConsolidatedMxn !== null &&
      totals.collectedAmountConsolidatedMxn !== null
        ? totals.assignedAmountConsolidatedMxn -
          totals.collectedAmountConsolidatedMxn
        : null;
    return totals;
  }
}
