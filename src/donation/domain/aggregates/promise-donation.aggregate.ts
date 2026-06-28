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

export interface ICollectorInstructions {
  weeklySchedule: {
    day: string;
    hours: string;
    note?: string;
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
  instructions?: ICollectorInstructions;
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

  public get instructions(): ICollectorInstructions | undefined {
    return this.props.instructions;
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

  public updateAmount(promiseAmount: number, currency: string): void {
    this.props.promiseAmount = promiseAmount;
    this.props.currency = currency;
    this.props.updatedAt = new Date();
  }

  public updateRecurrence(recurrence: number): void {
    this.props.recurrence = recurrence;
    this.props.updatedAt = new Date();
  }

  public updateInstructions(instructions: ICollectorInstructions): void {
    this.props.instructions = instructions;
    this.props.updatedAt = new Date();
  }

  public deactivate(reason: string): void {
    this.props.isActive = false;
    this.props.reasonDeactivate = reason;
    this.props.nextDonation = null;
    this.props.updatedAt = new Date();
  }

  public reactivate(): void {
    const anchorDay = this.props.startDate.getDate();
    const now = new Date();
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(anchorDay, daysInCurrentMonth);
    const candidate = new Date(now.getFullYear(), now.getMonth(), targetDay, 0, 0, 0, 0);
    if (candidate > now) {
      this.props.nextDonation = candidate;
    } else {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
      this.props.nextDonation = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(anchorDay, daysInNextMonth), 0, 0, 0, 0);
    }
    this.props.isActive = true;
    this.props.reasonDeactivate = null;
    this.props.updatedAt = new Date();
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

  public advanceNextDonationIfStale(): void {
    if (!this.props.nextDonation || !this.props.startDate) return;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (this.props.nextDonation >= currentMonthStart) return;
    while (this.props.nextDonation < currentMonthStart) {
      this.props.lastDonation = new Date(this.props.nextDonation);
      this.updateNextDonation();
    }
    this.props.updatedAt = new Date();
  }
}
