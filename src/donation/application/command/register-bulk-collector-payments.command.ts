import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

export class RegisterBulkCollectorPaymentsCommand {
  constructor(
    public readonly periodId: string,
    public readonly paymentMethod: CollectorPaymentMethod,
    public readonly paidAt: Date,
    public readonly registeredBy: string,
    public readonly reference?: string,
    public readonly notes?: string,
  ) {}
}
