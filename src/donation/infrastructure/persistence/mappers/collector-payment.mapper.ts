import {
  CollectorPayment,
  CollectorPaymentId,
  CollectorPaymentMethod,
} from '@/donation/domain/entities/collector-payment.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export interface ICollectorPaymentPersistence {
  id: string;
  settlementId: string;
  collectorId: string;
  amount: number;
  paymentMethod: CollectorPaymentMethod;
  reference: string | null;
  notes: string | null;
  paidAt: Date;
  registeredBy: string;
  createdAt: Date;
}

export class CollectorPaymentMapper {
  static toPersistence(
    payment: CollectorPayment,
  ): ICollectorPaymentPersistence {
    return {
      id: payment._id.unpack(),
      settlementId: payment.settlementId,
      collectorId: payment.collectorId.unpack(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      paidAt: payment.paidAt,
      registeredBy: payment.registeredBy.unpack(),
      createdAt: payment.createdAt,
    };
  }

  static toDomain(raw: ICollectorPaymentPersistence): CollectorPayment {
    return CollectorPayment.recreate(CollectorPaymentId.of(raw.id), {
      settlementId: raw.settlementId,
      collectorId: CollectorId.of(raw.collectorId),
      amount: Number(raw.amount),
      paymentMethod: raw.paymentMethod,
      reference: raw.reference,
      notes: raw.notes,
      paidAt: raw.paidAt,
      registeredBy: UserId.of(raw.registeredBy),
      createdAt: raw.createdAt,
    });
  }
}
