import {
  CollectorSettlement,
  CollectorSettlementId,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

export interface ICollectorSettlementPersistence {
  id: string;
  collectionPeriodId: string;
  collectorId: string;
  month: number;
  year: number;
  totalCollected: number;
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
