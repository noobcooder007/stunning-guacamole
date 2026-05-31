import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';

export class PromiseDonationId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(): PromiseDonationId {
    return new PromiseDonationId(uuidv7());
  }

  public static of(value: string): PromiseDonationId {
    return new PromiseDonationId(value);
  }

  public unpack(): string {
    return this.value;
  }
}

interface ICollectorInstructions {
  weeklySchedule: {
    day: string;
    hours: string;
    note: string;
  }[];
  generalObservations: string;
}

export interface PromiseDonationProps {
  beneficientId: BeneficientId;
  promiseAmount: number;
  currency: string;
  method: string;
  startDate: Date;
  recurring: boolean;
  recurrence: number;
  isActive: boolean;
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
  lastDonation?: Date;
  nextDonation?: Date;
  reasonDeactivate?: string;
  collectorInstructions?: ICollectorInstructions;
}

export class PromiseDonation extends AggregateRoot {
  private constructor(
    private readonly id: PromiseDonationId,
    private props: PromiseDonationProps,
  ) {
    super();
  }

  public static create(
    props: Omit<
      PromiseDonationProps,
      'isActive' | 'createdAt' | 'updatedAt' | 'nextDonation'
    >,
  ): PromiseDonation {
    GeneralGuard.againstStartDateBeforeNow(
      props.startDate,
      PromiseDonation.name,
    );
    GeneralGuard.againstGreatherThanZero(
      props.promiseAmount,
      'Promise amount must be greater than zero',
      PromiseDonation.name,
    );
    const id = PromiseDonationId.create();
    const now = new Date();
    return new PromiseDonation(id, {
      ...props,
      isActive: true,
      reasonDeactivate: null,
      nextDonation: props.startDate,
      lastDonation: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static recreate(
    id: string,
    props: PromiseDonationProps,
  ): PromiseDonation {
    const promiseDonationId = PromiseDonationId.of(id);
    return new PromiseDonation(promiseDonationId, props);
  }

  public get _id(): PromiseDonationId {
    return this.id;
  }

  public get beneficientId(): BeneficientId {
    return this.props.beneficientId;
  }

  public get promiseAmount(): number {
    return this.props.promiseAmount;
  }

  public get currency(): string {
    return this.props.currency;
  }

  public get method(): string {
    return this.props.method;
  }

  public get startDate(): Date {
    return this.props.startDate;
  }

  public get recurring(): boolean {
    return this.props.recurring;
  }

  public get recurrence(): number {
    return this.props.recurrence;
  }

  public get lastDonation(): Date {
    return this.props.lastDonation;
  }

  public get nextDonation(): Date {
    return this.props.nextDonation;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get reasonDeactivate(): string | null {
    return this.props.reasonDeactivate;
  }

  public get createdBy(): UserId {
    return this.props.createdBy;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public deactivate(reason: string): void {
    this.props.isActive = false;
    this.props.reasonDeactivate = reason;
    this.props.updatedAt = new Date();
    this.props.startDate = null;
    this.props.nextDonation = null;
  }

  public updateNextDonation(): void {
    const anchorDay = this.props.startDate.getDate();
    const nextDate = new Date(this.props.lastDonation);
    nextDate.setMonth(nextDate.getMonth() + this.props.recurrence);
    const daysInNextMonth = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth() + 1,
      0,
    ).getDate();
    const targetDay = Math.min(anchorDay, daysInNextMonth);
    nextDate.setDate(targetDay);
    nextDate.setHours(0, 0, 0, 0);
    this.props.nextDonation = nextDate;
    this.props.updatedAt = new Date();
  }

  public updateLastDonation(): void {
    this.props.lastDonation = new Date();
    this.props.updatedAt = new Date();
  }

  public updateLastDonationTo(date: Date): void {
    this.props.lastDonation = date;
    this.props.updatedAt = new Date();
  }
}
