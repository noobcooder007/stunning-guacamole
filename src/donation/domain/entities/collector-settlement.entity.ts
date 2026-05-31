import { v7 as uuidv7 } from 'uuid';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

interface CollectorSettlementProps {
  collectionPeriodId: string;
  collectorId: CollectorId;
  month: number;
  year: number;
  totalCollected: number;
  commissionPercent: number;
  commissionAmount: number;
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
    private readonly props: CollectorSettlementProps,
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

  public get commissionPercent(): number {
    return this.props.commissionPercent;
  }

  public get commissionAmount(): number {
    return this.props.commissionAmount;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
