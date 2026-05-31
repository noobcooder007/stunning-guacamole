import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import {
  CollectorEfficiencyResponseDto,
  HistoricalEfficiencyDto,
  PeriodEfficiencyDto,
  YearEfficiencyDto,
} from '@/donation/application/dto/collector-efficiency.response.dto';

@Injectable()
export class CollectorEfficiencyQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getEfficiency(collectorId: string): Promise<CollectorEfficiencyResponseDto> {
    const [byPeriodRaw, byYearRaw, historicalRaw] = await Promise.all([
      this.queryByPeriod(collectorId),
      this.queryByYear(collectorId),
      this.queryHistorical(collectorId),
    ]);

    return {
      collectorId,
      byPeriod: byPeriodRaw.map((r) => this.mapPeriodRow(r)),
      byYear: byYearRaw.map((r) => this.mapYearRow(r)),
      historical: this.mapHistoricalRow(historicalRaw),
    };
  }

  private async queryByPeriod(collectorId: string): Promise<any[]> {
    return this.dataSource
      .createQueryBuilder()
      .select('cp.id', 'periodId')
      .addSelect('cp.month', 'month')
      .addSelect('cp.year', 'year')
      .addSelect('cp.status', 'periodStatus')
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
      .innerJoin(
        CollectionPeriodSchema,
        'cp',
        'cp.id = r."collectionPeriodId"',
      )
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
    return this.dataSource
      .createQueryBuilder()
      .select('r."periodYear"', 'year')
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
      .where('r."collectorId" = :collectorId', { collectorId })
      .andWhere('r."periodYear" IS NOT NULL')
      .groupBy('r."periodYear"')
      .orderBy('r."periodYear"', 'DESC')
      .getRawMany();
  }

  private async queryHistorical(collectorId: string): Promise<any> {
    return this.dataSource
      .createQueryBuilder()
      .select(
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
      .where('r."collectorId" = :collectorId', { collectorId })
      .getRawOne();
  }

  private calcRate(collected: number, assigned: number): number {
    if (!assigned || assigned === 0) return 0;
    return Math.round((collected / assigned) * 10000) / 100;
  }

  private mapPeriodRow(r: any): PeriodEfficiencyDto {
    const assigned = Number(r.assignedAmount ?? 0);
    const collected = Number(r.collectedAmount ?? 0);
    return {
      periodId: r.periodId,
      month: Number(r.month),
      year: Number(r.year),
      periodStatus: r.periodStatus,
      assignedAmount: assigned,
      assignedCount: Number(r.assignedCount ?? 0),
      collectedAmount: collected,
      collectedCount: Number(r.collectedCount ?? 0),
      pendingAmount: Number(r.pendingAmount ?? 0),
      pendingCount: Number(r.pendingCount ?? 0),
      collectionRate: this.calcRate(collected, assigned),
    };
  }

  private mapYearRow(r: any): YearEfficiencyDto {
    const assigned = Number(r.assignedAmount ?? 0);
    const collected = Number(r.collectedAmount ?? 0);
    return {
      year: Number(r.year),
      assignedAmount: assigned,
      assignedCount: Number(r.assignedCount ?? 0),
      collectedAmount: collected,
      collectedCount: Number(r.collectedCount ?? 0),
      pendingAmount: Number(r.pendingAmount ?? 0),
      pendingCount: Number(r.pendingCount ?? 0),
      collectionRate: this.calcRate(collected, assigned),
    };
  }

  private mapHistoricalRow(r: any): HistoricalEfficiencyDto {
    const assigned = Number(r?.assignedAmount ?? 0);
    const collected = Number(r?.collectedAmount ?? 0);
    return {
      assignedAmount: assigned,
      assignedCount: Number(r?.assignedCount ?? 0),
      collectedAmount: collected,
      collectedCount: Number(r?.collectedCount ?? 0),
      pendingAmount: Number(r?.pendingAmount ?? 0),
      pendingCount: Number(r?.pendingCount ?? 0),
      collectionRate: this.calcRate(collected, assigned),
    };
  }
}
