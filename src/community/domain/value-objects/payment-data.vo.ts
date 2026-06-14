import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface PaymentDataProps {
  readonly commissionPercent: number;
  readonly bank: string;
  readonly reference: string;
  readonly nomina: number;
  readonly transportAllowance: number;
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

  get nomina(): number {
    return this.unpack().nomina;
  }

  get transportAllowance(): number {
    return this.unpack().transportAllowance;
  }

  public static of(props: PaymentDataProps): PaymentData {
    return new PaymentData(props);
  }
}
