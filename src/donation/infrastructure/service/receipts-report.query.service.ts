import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
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
        `SUM(CASE WHEN r.status != 'CANCELLED' THEN r.amount ELSE 0 END)`,
        'accumulatedAmount',
      )
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'p', 'p.id = c."profileId"')
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
      accumulatedAmount: Number(r.accumulatedAmount ?? 0),
    }));

    const totalAccumulatedAmount = collectors.reduce(
      (sum, c) => sum + c.accumulatedAmount,
      0,
    );

    return { month, year, collectors, totalAccumulatedAmount };
  }
}
