import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { PromiseDonationId } from '@/donation/domain/aggregates/promise-donation.aggregate';
import {
  Money,
  PaymentMethod,
  Receipt,
  ReceiptFolio,
  ReceiptId,
  ReceiptOrigin,
  ReceiptStatus,
  ReceiptType,
} from '@/donation/domain/aggregates/receipt.aggregate';

export interface IReceiptPersistence {
  id: string;
  status: string;
  folio: string;
  type: string;
  origin: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  externalReference: string;
  promiseDonationId: string;
  periodMonth: number;
  periodYear: number;
  beneficientId: string;
  collectorId: string;
  printCount: number;
  lastPrintedAt: Date;
  voidReason: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  chainValidator: string;
}

export class ReceiptMapper {
  static toPersistence(receipt: Receipt): IReceiptPersistence {
    return {
      id: receipt._id.unpack(),
      status: receipt.status,
      folio: receipt.folio.unpack(),
      type: receipt.type,
      origin: receipt.origin,
      amount: receipt.amount.unpack().amount,
      currency: receipt.amount.unpack().currency,
      paymentMethod: receipt.paymentMethod,
      externalReference: receipt.externalReference,
      promiseDonationId:
        receipt.promiseDonation && receipt.promiseDonation.unpack(),
      periodMonth: receipt.createdAt.getMonth() + 1,
      periodYear: receipt.createdAt.getFullYear(),
      beneficientId: receipt.beneficient && receipt.beneficient.unpack(),
      collectorId: receipt.collector.unpack(),
      printCount: receipt.printCount,
      lastPrintedAt: receipt.lastPrintedAt,
      voidReason: receipt.voidReason,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
      createdBy: receipt.createdBy.unpack(),
      updatedBy: receipt.updatedBy.unpack(),
      chainValidator: receipt.chainValidator,
    };
  }

  static toDomain(raw: IReceiptPersistence): Receipt {
    return Receipt.recreate(ReceiptId.of(raw.id), {
      status: raw.status as ReceiptStatus,
      folio: ReceiptFolio.of(raw.folio),
      type: raw.type as ReceiptType,
      origin: raw.origin as ReceiptOrigin,
      amount: Money.of(raw.amount, raw.currency as 'MXN' | 'USD'),
      paymentMethod: raw.paymentMethod as PaymentMethod,
      externalReference: raw.externalReference,
      promiseDonation: PromiseDonationId.of(raw.promiseDonationId),
      month: raw.periodMonth,
      year: raw.periodYear,
      beneficient: raw.beneficientId && BeneficientId.of(raw.beneficientId),
      collector: CollectorId.of(raw.collectorId),
      printCount: raw.printCount,
      lastPrintedAt: raw.lastPrintedAt,
      voidReason: raw.voidReason,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      createdBy: UserId.of(raw.createdBy),
      updatedBy: UserId.of(raw.updatedBy),
      chainValidator: raw.chainValidator,
    });
  }
}
