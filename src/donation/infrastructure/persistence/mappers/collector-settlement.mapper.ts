import {
  CollectorSettlement,
  CollectorSettlementId,
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
      createdAt: raw.createdAt,
    });
  }
}
