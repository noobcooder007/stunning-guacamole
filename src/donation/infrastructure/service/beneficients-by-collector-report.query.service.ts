import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import {
  BeneficientReportItemDto,
  BeneficientsByCollectorReportResponseDto,
  CollectorBeneficientsReportItemDto,
  PeriodDonationReportDto,
} from '@/donation/application/dto/beneficients-by-collector-report.response.dto';

export interface ReceiptReportRow {
  collectorNumber: number;
  collectorFirstname: string;
  collectorFirstLastname: string;
  collectorSecondLastname: string | null;
  beneficientNumber: number;
  beneficientFirstname: string;
  beneficientFirstLastname: string;
  beneficientSecondLastname: string | null;
  folio: string;
  type: 'RECURRING' | 'SPECIAL';
  amount: string;
  currency: string;
  periodMonth: number;
  periodYear: number;
  paidAt: Date | null;
  paidPeriodMonth: number | null;
  paidPeriodYear: number | null;
}

@Injectable()
export class BeneficientsByCollectorReportQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getReport(
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number,
    includeSpecial: boolean,
    collectorNumber?: number,
  ): Promise<BeneficientsByCollectorReportResponseDto> {
    const fromKey = fromYear * 12 + fromMonth;
    const toKey = toYear * 12 + toMonth;

    const qb = this.dataSource
      .createQueryBuilder()
      .select('c."collectorNumber"', 'collectorNumber')
      .addSelect('cp.firstname', 'collectorFirstname')
      .addSelect('cp."firstLastname"', 'collectorFirstLastname')
      .addSelect('cp."secondLastname"', 'collectorSecondLastname')
      .addSelect('b."beneficientNumber"', 'beneficientNumber')
      .addSelect('bp.firstname', 'beneficientFirstname')
      .addSelect('bp."firstLastname"', 'beneficientFirstLastname')
      .addSelect('bp."secondLastname"', 'beneficientSecondLastname')
      .addSelect('r.folio', 'folio')
      .addSelect('r.type', 'type')
      .addSelect('r.amount', 'amount')
      .addSelect('r.currency', 'currency')
      .addSelect('r."periodMonth"', 'periodMonth')
      .addSelect('r."periodYear"', 'periodYear')
      .addSelect('r."paidAt"', 'paidAt')
      .addSelect('period.month', 'paidPeriodMonth')
      .addSelect('period.year', 'paidPeriodYear')
      .from(ReceiptSchema, 'r')
      .innerJoin(CollectorSchema, 'c', 'c.id = r."collectorId"')
      .innerJoin(ProfileSchema, 'cp', 'cp.id = c."profileId"')
      .innerJoin(BeneficientSchema, 'b', 'b.id = r."beneficientId"')
      .innerJoin(ProfileSchema, 'bp', 'bp.id = b."profileId"')
      .leftJoin(
        CollectionPeriodSchema,
        'period',
        'period.id = r."collectionPeriodId"',
      )
      .where(`r.status = 'PAID'`)
      .andWhere(
        `(r."periodYear" * 12 + r."periodMonth") BETWEEN :fromKey AND :toKey`,
        { fromKey, toKey },
      )
      .orderBy('c."collectorNumber"', 'ASC')
      .addOrderBy('b."beneficientNumber"', 'ASC')
      .addOrderBy('r."periodYear"', 'ASC')
      .addOrderBy('r."periodMonth"', 'ASC');

    if (!includeSpecial) {
      qb.andWhere(`r.type = 'RECURRING'`);
    }
    if (collectorNumber !== undefined) {
      qb.andWhere('c."collectorNumber" = :collectorNumber', {
        collectorNumber,
      });
    }

    const rows = await qb.getRawMany<ReceiptReportRow>();

    return {
      fromMonth,
      fromYear,
      toMonth,
      toYear,
      includeSpecial,
      collectors: groupReceiptReportRows(rows),
    };
  }
}

// Función pura (sin dependencias de BD) para poder testear la lógica de
// agrupación y de isDelayed de forma aislada.
export function groupReceiptReportRows(
  rows: ReceiptReportRow[],
): CollectorBeneficientsReportItemDto[] {
  const collectorMap = new Map<number, CollectorBeneficientsReportItemDto>();
  const beneficientMap = new Map<string, BeneficientReportItemDto>();
  const periodMap = new Map<string, PeriodDonationReportDto>();

  for (const row of rows) {
    let collector = collectorMap.get(row.collectorNumber);
    if (!collector) {
      collector = {
        collectorNumber: row.collectorNumber,
        collectorName: [
          row.collectorFirstname,
          row.collectorFirstLastname,
          row.collectorSecondLastname,
        ]
          .filter(Boolean)
          .join(' '),
        beneficients: [],
      };
      collectorMap.set(row.collectorNumber, collector);
    }

    const beneficientKey = `${row.collectorNumber}:${row.beneficientNumber}`;
    let beneficient = beneficientMap.get(beneficientKey);
    if (!beneficient) {
      beneficient = {
        beneficientNumber: row.beneficientNumber,
        beneficientName: [
          row.beneficientFirstname,
          row.beneficientFirstLastname,
          row.beneficientSecondLastname,
        ]
          .filter(Boolean)
          .join(' '),
        periods: [],
        totalDonatedMxn: 0,
        totalDonatedUsd: 0,
      };
      beneficientMap.set(beneficientKey, beneficient);
      collector.beneficients.push(beneficient);
    }

    const periodKey = `${beneficientKey}:${row.periodYear}-${row.periodMonth}`;
    let period = periodMap.get(periodKey);
    if (!period) {
      period = {
        periodMonth: row.periodMonth,
        periodYear: row.periodYear,
        receipts: [],
      };
      periodMap.set(periodKey, period);
      beneficient.periods.push(period);
    }

    // Un recibo PAID sin CollectionPeriod vinculado (ej. no había ningún
    // periodo OPEN al momento de marcarlo como pagado, ver
    // MarkAsPaidReceiptsCommandHandler) no permite determinar si se pagó a
    // tiempo o tarde: se reporta como null en vez de asumir "a tiempo".
    const isDelayed =
      row.paidPeriodMonth === null || row.paidPeriodYear === null
        ? null
        : row.paidPeriodMonth !== row.periodMonth ||
          row.paidPeriodYear !== row.periodYear;

    const amount = Number(row.amount);
    period.receipts.push({
      folio: row.folio,
      type: row.type,
      amount,
      currency: row.currency,
      paidAt: row.paidAt,
      isDelayed,
      paidPeriodMonth: row.paidPeriodMonth,
      paidPeriodYear: row.paidPeriodYear,
    });

    if (row.currency === 'USD') {
      beneficient.totalDonatedUsd += amount;
    } else {
      beneficient.totalDonatedMxn += amount;
    }
  }

  return Array.from(collectorMap.values());
}
