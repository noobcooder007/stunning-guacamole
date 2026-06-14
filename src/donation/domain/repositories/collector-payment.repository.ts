import { Injectable } from '@nestjs/common';
import { CollectorPayment } from '@/donation/domain/entities/collector-payment.entity';

@Injectable()
export abstract class ICollectorPaymentRepository {
  abstract save(payment: CollectorPayment): Promise<void>;
  abstract saveMany(payments: CollectorPayment[]): Promise<void>;
  abstract findBySettlementId(settlementId: string): Promise<CollectorPayment[]>;
}
