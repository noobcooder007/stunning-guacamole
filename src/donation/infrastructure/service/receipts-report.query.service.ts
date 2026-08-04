import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import {
  CollectorReceiptsReportItemDto,
  ReceiptsReportByPeriodResponseDto,
} from '@/donation/application/dto/receipts-report-by-period.response.dto';

@Injectable()
export class ReceiptsReportQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getReportByPeriod(
    month: number,
    year: number,
  ): Promise<ReceiptsReportByPeriodResponseDto> {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('c."collectorNumber"', 'collectorNumber')
      .addSelect('p.firstname', 'firstname')
      .addSelect('p."firstLastname"', 'firstLastname')
      .addSelect('p."secondLastname"', 'secondLastname')
      .addSelect(
        `SUM(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'MXN' THEN r.amount ELSE 0 END)`,
        'accumulatedAmountMxn',
      )
      .addSelect(
        `SUM(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'USD' THEN r.amount ELSE 0 END)`,
        'accumulatedAmountUsd',
      )
      .addSelect(
        `SUM(CASE
          WHEN r.status != 'CANCELLED' AND r.currency = 'MXN' THEN r.amount
          WHEN r.status != 'CANCELLED' AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NOT NULL THEN r.amount * cp."exchangeRateUsdToMxn"
          ELSE 0
        END)`,
        'accumulatedAmountConsolidatedMxn',
      )
      .addSelect(
        // SUM() ignora los NULL de la CASE de arriba en vez de propagarlos:
        // este flag detecta si hubo algún USD sin tipo de cambio para forzar
        // el consolidado a null en JS, en vez de reportar un total parcial.
        `MAX(CASE WHEN r.status != 'CANCELLED' AND r.currency = 'USD' AND cp."exchangeRateUsdToMxn" IS NULL THEN 1 ELSE 0 END)`,
        'accumulatedHasUnconvertedUsd',
      )
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
      .leftJoin(CollectionPeriodSchema, 'cp', 'cp.id = r."collectionPeriodId"')
      .where('r."periodMonth" = :month', { month })
      .andWhere('r."periodYear" = :year', { year })
      .groupBy('c."collectorNumber"')
      .addGroupBy('p.firstname')
      .addGroupBy('p."firstLastname"')
      .addGroupBy('p."secondLastname"')
      .orderBy('c."collectorNumber"', 'ASC')
      .getRawMany();

    const collectors: CollectorReceiptsReportItemDto[] = rows.map((r) => ({
      collectorNumber: Number(r.collectorNumber),
      collectorName: [r.firstname, r.firstLastname, r.secondLastname]
        .filter(Boolean)
        .join(' '),
      accumulatedAmountMxn: Number(r.accumulatedAmountMxn ?? 0),
      accumulatedAmountUsd: Number(r.accumulatedAmountUsd ?? 0),
      accumulatedAmountConsolidatedMxn: Number(r.accumulatedHasUnconvertedUsd)
        ? null
        : Number(r.accumulatedAmountConsolidatedMxn ?? 0),
    }));

    const totalAccumulatedAmountMxn = collectors.reduce(
      (sum, c) => sum + c.accumulatedAmountMxn,
      0,
    );
    const totalAccumulatedAmountUsd = collectors.reduce(
      (sum, c) => sum + c.accumulatedAmountUsd,
      0,
    );
    const totalAccumulatedAmountConsolidatedMxn = collectors.some(
      (c) => c.accumulatedAmountConsolidatedMxn === null,
    )
      ? null
      : collectors.reduce(
          (sum, c) => sum + c.accumulatedAmountConsolidatedMxn,
          0,
        );

    return {
      month,
      year,
      collectors,
      totalAccumulatedAmountMxn,
      totalAccumulatedAmountUsd,
      totalAccumulatedAmountConsolidatedMxn,
    };
  }
}
