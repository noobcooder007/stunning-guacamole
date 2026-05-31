import { Injectable } from '@nestjs/common';
import { CollectionPeriod } from '@/donation/domain/aggregates/collection-period.aggregate';

@Injectable()
export abstract class ICollectionPeriodRepository {
  abstract findOpen(): Promise<CollectionPeriod | null>;
  abstract findById(id: string): Promise<CollectionPeriod | null>;
  abstract save(period: CollectionPeriod): Promise<void>;
}
