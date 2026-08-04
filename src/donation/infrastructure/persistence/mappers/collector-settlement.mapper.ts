import {
  CollectorSettlement,
  CollectorSettlementId,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { Currency } from '@/shared/domain/enums/currency.enum';

export interface ICollectorSettlementPersistence {
  id: string;
  collectionPeriodId: string;
  collectorId: string;
  month: number;
  year: number;
  totalCollected: number;
  collectedByCurrency: Partial<Record<Currency, number>>;
  commissionPercent: number;
  commissionAmount: number;
  nomina: number;
  transportAllowance: number;
  netCommission: number;
  paymentStatus: CollectorSettlementPaymentStatus;
  totalPaid: number;
  createdAt: Date;
}

export class CollectorSettlementMapper {
  static toPersistence(
    settlement: CollectorSettlement,
  ): ICollectorSettlementPersistence {
    return {
      id: settlement._id.unpack(),
      collectionPeriodId: settlement.collectionPeriodId,
      collectorId: settlement.collectorId.unpack(),
      month: settlement.month,
      year: settlement.year,
      totalCollected: settlement.totalCollected,
      collectedByCurrency: settlement.collectedByCurrency,
      commissionPercent: settlement.commissionPercent,
      commissionAmount: settlement.commissionAmount,
      nomina: settlement.nomina,
      transportAllowance: settlement.transportAllowance,
      netCommission: settlement.netCommission,
      paymentStatus: settlement.paymentStatus,
      totalPaid: settlement.totalPaid,
      createdAt: settlement.createdAt,
    };
  }

  static toDomain(raw: ICollectorSettlementPersistence): CollectorSettlement {
    return CollectorSettlement.recreate(CollectorSettlementId.of(raw.id), {
      collectionPeriodId: raw.collectionPeriodId,
      collectorId: CollectorId.of(raw.collectorId),
      month: raw.month,
      year: raw.year,
      totalCollected: Number(raw.totalCollected),
      collectedByCurrency: raw.collectedByCurrency ?? {},
      commissionPercent: raw.commissionPercent,
      commissionAmount: Number(raw.commissionAmount),
      nomina: Number(raw.nomina),
      transportAllowance: Number(raw.transportAllowance),
      netCommission: Number(raw.netCommission),
      paymentStatus: raw.paymentStatus,
      totalPaid: Number(raw.totalPaid),
      createdAt: raw.createdAt,
    });
  }
}
