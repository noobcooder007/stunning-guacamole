import {
  CollectionPeriod,
  CollectionPeriodId,
  CollectionPeriodStatus,
} from '@/donation/domain/aggregates/collection-period.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export interface ICollectionPeriodPersistence {
  id: string;
  month: number;
  year: number;
  status: string;
  closedAt: Date;
  closedBy: string;
  createdAt: Date;
  createdBy: string;
  totalCollected: number;
  totalCommissions: number;
  totalNet: number;
}

export class CollectionPeriodMapper {
  static toPersistence(period: CollectionPeriod): ICollectionPeriodPersistence {
    return {
      id: period._id.unpack(),
      month: period.month,
      year: period.year,
      status: period.status,
      closedAt: period.closedAt ?? null,
      closedBy: period.closedBy ? period.closedBy.unpack() : null,
      createdAt: period.createdAt,
      createdBy: period.createdBy.unpack(),
      totalCollected: period.totalCollected ?? null,
      totalCommissions: period.totalCommissions ?? null,
      totalNet: period.totalNet ?? null,
    };
  }

  static toDomain(raw: ICollectionPeriodPersistence): CollectionPeriod {
    return CollectionPeriod.recreate(CollectionPeriodId.of(raw.id), {
      month: raw.month,
      year: raw.year,
      status: raw.status as CollectionPeriodStatus,
      closedAt: raw.closedAt ?? undefined,
      closedBy: raw.closedBy ? UserId.of(raw.closedBy) : undefined,
      createdAt: raw.createdAt,
      createdBy: UserId.of(raw.createdBy),
      totalCollected: raw.totalCollected != null ? Number(raw.totalCollected) : undefined,
      totalCommissions: raw.totalCommissions != null ? Number(raw.totalCommissions) : undefined,
      totalNet: raw.totalNet != null ? Number(raw.totalNet) : undefined,
    });
  }
}
