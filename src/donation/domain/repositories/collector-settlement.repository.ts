import { Injectable } from '@nestjs/common';
import { CollectorSettlement } from '@/donation/domain/entities/collector-settlement.entity';

@Injectable()
export abstract class ICollectorSettlementRepository {
  abstract saveMany(settlements: CollectorSettlement[]): Promise<void>;
  abstract findByPeriodId(periodId: string): Promise<CollectorSettlement[]>;
}
