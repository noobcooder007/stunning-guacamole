import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { PromiseDonationId } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';

export class ReceiptId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(): ReceiptId {
    return new ReceiptId(uuidv7());
  }

  public static of(value: string): ReceiptId {
    return new ReceiptId(value);
  }

  public unpack(): string {
    return this.value;
  }
}

export class Money extends ValueObject<{
  amount: number;
  currency: string;
}> {
  private constructor(props: { amount: number; currency: string }) {
    GeneralGuard.againstGreatherThanZero(
      props.amount,
      'Amount must be greater than zero',
      'Money',
    );
    GeneralGuard.againstNullOrUndefined(
      props.currency,
      'Currency is required',
      'Money',
    );
    super(props);
  }

  public static of(amount: number, currency: 'MXN' | 'USD'): Money {
    return new Money({ amount, currency });
  }

  public get amount(): number {
    return this.value.amount;
  }

  public get currency(): string {
    return this.value.currency;
  }

  public unpack() {
    return this.value;
  }
}

export class ReceiptFolio extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(
    date: Date,
    colector: string,
    sequence: number,
    type: ReceiptType,
  ): ReceiptFolio {
    const months = [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ];
    const period = `${months[date.getMonth()]}${date.getFullYear()}`;
    const typePrefix = {
      RECURRING: 'R',
      SPECIAL: 'S',
    }[type];
    const folio = sequence.toString().padStart(4, '0');
    return new ReceiptFolio(`${period}-${colector}-${typePrefix}-${folio}`);
  }

  public static of(value: string): ReceiptFolio {
    return new ReceiptFolio(value);
  }

  public unpack(): string {
    return this.value;
  }
}

export type ReceiptStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type ReceiptType = 'RECURRING' | 'SPECIAL';
export type ReceiptOrigin = 'PROMISE' | 'NON_PROMISE';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

interface ReceiptProps {
  folio: ReceiptFolio;
  status: ReceiptStatus;
  type: ReceiptType;
  origin: ReceiptOrigin;
  amount: Money;
  paymentMethod?: PaymentMethod;
  externalReference?: string;
  promiseDonation?: PromiseDonationId;
  month?: number;
  year?: number;
  beneficient?: BeneficientId;
  collector?: CollectorId;
  printCount: number;
  lastPrintedAt?: Date;
  voidReason?: string;
  createdAt?: Date;
  updatedAt: Date;
  createdBy: UserId;
  updatedBy: UserId;
  chainValidator?: string;
  collectionPeriodId?: string;
  paidAt?: Date;
}

export class Receipt extends AggregateRoot {
  private constructor(
    private readonly id: ReceiptId,
    private readonly props: ReceiptProps,
  ) {
    super();
  }

  public static createRecurring(
    folio: ReceiptFolio,
    money: Money,
    promiseId: PromiseDonationId,
    beneficientId: BeneficientId,
    collectorId: CollectorId,
    createdBy: UserId,
    chainValidator: string,
    month: number,
    year: number,
    collectionPeriodId?: string,
  ): Receipt {
    const id = ReceiptId.create();
    return new Receipt(id, {
      folio,
      amount: money,
      status: 'PENDING',
      type: 'RECURRING',
      origin: 'PROMISE',
      printCount: 0,
      promiseDonation: promiseId,
      month,
      year,
      beneficient: beneficientId,
      collector: collectorId,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      chainValidator: chainValidator,
      collectionPeriodId,
    });
  }

  public static createSpecial(
    folio: ReceiptFolio,
    money: Money,
    collectorId: CollectorId,
    createdBy: UserId,
    chainValidator: string,
    beneficientId: BeneficientId,
    collectionPeriodId?: string,
  ): Receipt {
    GeneralGuard.againstNullOrUndefined(
      beneficientId,
      'Beneficient is required to create a receipt',
      'Receipt',
    );
    const id = ReceiptId.create();
    return new Receipt(id, {
      folio,
      amount: money,
      status: 'PENDING',
      type: 'SPECIAL',
      origin: 'NON_PROMISE',
      printCount: 0,
      collector: collectorId,
      beneficient: beneficientId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      chainValidator: chainValidator,
      collectionPeriodId,
    });
  }

  public static recreate(id: ReceiptId, props: ReceiptProps): Receipt {
    return new Receipt(id, props);
  }

  public get _id(): ReceiptId {
    return this.id;
  }

  public get folio(): ReceiptFolio {
    return this.props.folio;
  }

  public get status(): ReceiptStatus {
    return this.props.status;
  }

  public get printCount(): number {
    return this.props.printCount;
  }

  public get amount(): Money {
    return this.props.amount;
  }

  public get type(): ReceiptType {
    return this.props.type;
  }

  public get promiseDonation(): PromiseDonationId | undefined {
    return this.props.promiseDonation;
  }

  public get beneficient(): BeneficientId | undefined {
    return this.props.beneficient;
  }

  public get collector(): CollectorId | undefined {
    return this.props.collector;
  }

  public get origin(): ReceiptOrigin {
    return this.props.origin;
  }

  public get paymentMethod(): string | undefined {
    return this.props.paymentMethod;
  }

  public get externalReference(): string | undefined {
    return this.props.externalReference;
  }

  public get voidReason(): string | undefined {
    return this.props.voidReason;
  }

  public get lastPrintedAt(): Date | undefined {
    return this.props.lastPrintedAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get createdBy(): UserId {
    return this.props.createdBy;
  }

  public get updatedBy(): UserId {
    return this.props.updatedBy;
  }

  public get chainValidator(): string | undefined {
    return this.props.chainValidator;
  }

  public get collectionPeriodId(): string | undefined {
    return this.props.collectionPeriodId;
  }

  public get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  public get periodMonth(): number {
    return this.props.month;
  }

  public get periodYear(): number {
    return this.props.year;
  }

  public markAsPaid(
    method: PaymentMethod,
    collectionPeriodId?: string,
    reference?: string,
  ): void {
    GeneralGuard.againstValueIsEqualTo(this.props.status, 'PAID', 'Receipt');
    GeneralGuard.againstValueIsEqualTo(
      this.props.status,
      'CANCELLED',
      'Receipt',
    );
    GeneralGuard.againstGreatherThanZero(
      this.props.amount.amount,
      'Amount must be greater than zero',
      'Receipt',
    );
    this.props.status = 'PAID';
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();
    this.props.externalReference = reference;
    this.props.paymentMethod = method;
    this.props.collectionPeriodId = collectionPeriodId;
  }

  public updatePrintCount(): void {
    this.props.printCount++;
    this.props.lastPrintedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public get shouldShowWatermark(): boolean {
    return this.printCount > 0;
  }

  public cancel(reason: string, userId: string) {
    GeneralGuard.againstValueIsNotEqualTo(
      this.props.status,
      'PENDING',
      'Receipt',
    );
    GeneralGuard.againstNullOrUndefined(
      reason,
      'Reason is required',
      'Receipt',
    );
    this.props.voidReason = reason;
    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date();
    this.props.updatedBy = UserId.of(userId);
  }

  public async generateValidationChain(hasher: IDataHasher) {
    const amount = Number(this.amount.unpack().amount);
    const data = `${this._id.unpack()}|${this.folio.unpack()}|${amount}|${this.beneficient && this.beneficient.unpack()}`;
    this.props.chainValidator = (await hasher.hash(data))
      .substring(0, 16)
      .toUpperCase();
  }
}
