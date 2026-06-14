import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

export class CollectorPaymentResponseDto {
  id: string;
  settlementId: string;
  collectorId: string;
  amount: number;
  paymentMethod: CollectorPaymentMethod;
  reference: string | null;
  notes: string | null;
  paidAt: Date;
  registeredBy: string;
  createdAt: Date;
}
