import { v7 as uuidv7 } from 'uuid';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { Currency } from '@/shared/domain/enums/currency.enum';

export enum CollectorSettlementPaymentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

interface CollectorSettlementProps {
  collectionPeriodId: string;
  collectorId: CollectorId;
  month: number;
  year: number;
  // totalCollected ya está convertido a MXN (moneda base); collectedByCurrency
  // conserva el desglose crudo por moneda solo para trazabilidad/auditoría.
  totalCollected: number;
  collectedByCurrency: Partial<Record<Currency, number>>;
  commissionPercent: number;
  commissionAmount: number;
  nomina: number;
  transportAllowance: number;
  netCommission: number;
  paymentStatus: CollectorSettlementPaymentStatus;
  totalPaid: number;
  createdAt: Date;
}

export class CollectorSettlementId {
  private constructor(private readonly value: string) {}

  public static create(): CollectorSettlementId {
    return new CollectorSettlementId(uuidv7());
  }

  public static of(value: string): CollectorSettlementId {
    return new CollectorSettlementId(value);
  }

  public unpack(): string {
    return this.value;
  }
}

export class CollectorSettlement {
  private constructor(
    private readonly id: CollectorSettlementId,
    private props: CollectorSettlementProps,
  ) {}

  public static create(props: CollectorSettlementProps): CollectorSettlement {
    return new CollectorSettlement(CollectorSettlementId.create(), props);
  }

  public static recreate(
    id: CollectorSettlementId,
    props: CollectorSettlementProps,
  ): CollectorSettlement {
    return new CollectorSettlement(id, props);
  }

  public registerPayment(amount: number): void {
    const remaining = this.props.netCommission - this.props.totalPaid;
    if (amount > remaining) {
      throw new Error(
        `Payment amount ${amount} exceeds remaining balance ${remaining}`,
      );
    }
    this.props.totalPaid =
      Math.round((this.props.totalPaid + amount) * 100) / 100;
    if (this.props.totalPaid >= this.props.netCommission) {
      this.props.paymentStatus = CollectorSettlementPaymentStatus.PAID;
    } else {
      this.props.paymentStatus =
        CollectorSettlementPaymentStatus.PARTIALLY_PAID;
    }
  }

  public get _id(): CollectorSettlementId {
    return this.id;
  }

  public get collectionPeriodId(): string {
    return this.props.collectionPeriodId;
  }

  public get collectorId(): CollectorId {
    return this.props.collectorId;
  }

  public get month(): number {
    return this.props.month;
  }

  public get year(): number {
    return this.props.year;
  }

  public get totalCollected(): number {
    return this.props.totalCollected;
  }

  public get collectedByCurrency(): Partial<Record<Currency, number>> {
    return this.props.collectedByCurrency;
  }

  public get commissionPercent(): number {
    return this.props.commissionPercent;
  }

  public get commissionAmount(): number {
    return this.props.commissionAmount;
  }

  public get nomina(): number {
    return this.props.nomina;
  }

  public get transportAllowance(): number {
    return this.props.transportAllowance;
  }

  public get netCommission(): number {
    return this.props.netCommission;
  }

  public get paymentStatus(): CollectorSettlementPaymentStatus {
    return this.props.paymentStatus;
  }

  public get totalPaid(): number {
    return this.props.totalPaid;
  }

  public get remainingBalance(): number {
    return (
      Math.round((this.props.netCommission - this.props.totalPaid) * 100) / 100
    );
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
