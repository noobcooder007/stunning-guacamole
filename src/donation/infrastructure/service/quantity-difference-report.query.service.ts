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
      difference: assigned - collected,
    };
  }

  private sumTotals(
    rows: QuantityDifferenceRowDto[],
  ): QuantityDifferenceTotalsDto {
    return rows.reduce(
      (acc, row) => {
        acc.assignedAmount += row.assignedAmount;
        acc.assignedCount += row.assignedCount;
        acc.collectedAmount += row.collectedAmount;
        acc.collectedCount += row.collectedCount;
        acc.difference += row.difference;
        return acc;
      },
      {
        assignedAmount: 0,
        assignedCount: 0,
        collectedAmount: 0,
        collectedCount: 0,
        difference: 0,
      },
    );
  }
}
