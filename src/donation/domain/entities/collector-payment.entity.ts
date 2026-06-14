import { v7 as uuidv7 } from 'uuid';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export enum CollectorPaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

interface CollectorPaymentProps {
  settlementId: string;
  collectorId: CollectorId;
  amount: number;
  paymentMethod: CollectorPaymentMethod;
  reference?: string | null;
  notes?: string | null;
  paidAt: Date;
  registeredBy: UserId;
  createdAt: Date;
}

export class CollectorPaymentId {
  private constructor(private readonly value: string) {}

  public static create(): CollectorPaymentId {
    return new CollectorPaymentId(uuidv7());
  }

  public static of(value: string): CollectorPaymentId {
    return new CollectorPaymentId(value);
  }

  public unpack(): string {
    return this.value;
  }
}

export class CollectorPayment {
  private constructor(
    private readonly id: CollectorPaymentId,
    private readonly props: CollectorPaymentProps,
  ) {}

  public static create(props: CollectorPaymentProps): CollectorPayment {
    return new CollectorPayment(CollectorPaymentId.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  public static recreate(
    id: CollectorPaymentId,
    props: CollectorPaymentProps,
  ): CollectorPayment {
    return new CollectorPayment(id, props);
  }

  public get _id(): CollectorPaymentId {
    return this.id;
  }

  public get settlementId(): string {
    return this.props.settlementId;
  }

  public get collectorId(): CollectorId {
    return this.props.collectorId;
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get paymentMethod(): CollectorPaymentMethod {
    return this.props.paymentMethod;
  }

  public get reference(): string | null {
    return this.props.reference ?? null;
  }

  public get notes(): string | null {
    return this.props.notes ?? null;
  }

  public get paidAt(): Date {
    return this.props.paidAt;
  }

  public get registeredBy(): UserId {
    return this.props.registeredBy;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
