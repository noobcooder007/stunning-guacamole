import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

export class RegisterCollectorPaymentCommand {
  constructor(
    public readonly settlementId: string,
    public readonly amount: number,
    public readonly paymentMethod: CollectorPaymentMethod,
    public readonly paidAt: Date,
    public readonly registeredBy: string,
    public readonly reference?: string,
    public readonly notes?: string,
  ) {}
}
