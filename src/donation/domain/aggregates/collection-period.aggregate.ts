import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';

export class CollectionPeriodId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(): CollectionPeriodId {
    return new CollectionPeriodId(uuidv7());
  }

  public static of(value: string): CollectionPeriodId {
    return new CollectionPeriodId(value);
  }

  public unpack(): string {
    return this.value;
  }
}

export type CollectionPeriodStatus = 'OPEN' | 'CLOSED';

interface CollectionPeriodProps {
  month: number;
  year: number;
  status: CollectionPeriodStatus;
  closedAt?: Date;
  closedBy?: UserId;
  createdAt: Date;
  createdBy: UserId;
  totalCollected?: number;
  totalCommissions?: number;
  totalNet?: number;
  exchangeRateUsdToMxn?: number;
}

export class CollectionPeriod extends AggregateRoot {
  private constructor(
    private readonly id: CollectionPeriodId,
    private readonly props: CollectionPeriodProps,
  ) {
    super();
  }

  public static open(
    month: number,
    year: number,
    createdBy: UserId,
  ): CollectionPeriod {
    GeneralGuard.againstNullOrUndefined(
      month,
      'Month is required',
      CollectionPeriod.name,
    );
    GeneralGuard.againstNullOrUndefined(
      year,
      'Year is required',
      CollectionPeriod.name,
    );
    return new CollectionPeriod(CollectionPeriodId.create(), {
      month,
      year,
      status: 'OPEN',
      createdAt: new Date(),
      createdBy,
    });
  }

  public static recreate(
    id: CollectionPeriodId,
    props: CollectionPeriodProps,
  ): CollectionPeriod {
    return new CollectionPeriod(id, props);
  }

  public get _id(): CollectionPeriodId {
    return this.id;
  }

  public get month(): number {
    return this.props.month;
  }

  public get year(): number {
    return this.props.year;
  }

  public get status(): CollectionPeriodStatus {
    return this.props.status;
  }

  public get isOpen(): boolean {
    return this.props.status === 'OPEN';
  }

  public get closedAt(): Date | undefined {
    return this.props.closedAt;
  }

  public get closedBy(): UserId | undefined {
    return this.props.closedBy;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get createdBy(): UserId {
    return this.props.createdBy;
  }

  public get totalCollected(): number | undefined {
    return this.props.totalCollected;
  }

  public get totalCommissions(): number | undefined {
    return this.props.totalCommissions;
  }

  public get totalNet(): number | undefined {
    return this.props.totalNet;
  }

  public get exchangeRateUsdToMxn(): number | undefined {
    return this.props.exchangeRateUsdToMxn;
  }

  public close(
    closedBy: UserId,
    totalCollected: number,
    totalCommissions: number,
    exchangeRateUsdToMxn?: number,
  ): void {
    if (this.props.status === 'CLOSED') {
      throw new Error('Period is already closed');
    }
    this.props.status = 'CLOSED';
    this.props.closedAt = new Date();
    this.props.closedBy = closedBy;
    this.props.totalCollected = totalCollected;
    this.props.totalCommissions = totalCommissions;
    this.props.totalNet = totalCollected - totalCommissions;
    this.props.exchangeRateUsdToMxn = exchangeRateUsdToMxn;
  }
}
