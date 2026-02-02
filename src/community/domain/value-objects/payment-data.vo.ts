import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface PaymentDataProps {
  readonly commissionPercent: number;
  readonly bank: string;
  readonly reference: string;
}

export class PaymentData extends ValueObject<PaymentDataProps> {
  private constructor(props: PaymentDataProps) {
    super(props);
  }

  get commissionPercent(): number {
    return this.unpack().commissionPercent;
  }

  get bank(): string {
    return this.unpack().bank;
  }

  get reference(): string {
    return this.unpack().reference;
  }

  public static of(props: PaymentDataProps): PaymentData {
    return new PaymentData(props);
  }
}
