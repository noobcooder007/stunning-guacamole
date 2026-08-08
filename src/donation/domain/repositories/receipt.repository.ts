import { Injectable } from '@nestjs/common';
import { Receipt } from '@/donation/domain/aggregates/receipt.aggregate';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';

export type PrintReceiptType = 'RECURRING' | 'SPECIAL';

export interface PrintReceiptFilters {
  collectorId?: string;
  collectorNumber?: number;
  firstname?: string;
  firstLastname?: string;
  secondLastname?: string;
  month?: number;
  year?: number;
  type?: PrintReceiptType;
  folio?: string;
}

export interface PrintReceiptRangeFilters {
  collectorId?: string;
  collectorNumber?: number;
  firstname?: string;
  firstLastname?: string;
  secondLastname?: string;
  month: number;
  year: number;
  fromSequence: number;
  toSequence: number;
}

@Injectable()
export abstract class IReceiptRepository {
  abstract save(receipt: Receipt): Promise<void>;
  abstract save(receipt: Receipt[]): Promise<void>;
  abstract exists(
    promiseDonationId: string,
    month: number,
    year: number,
  ): Promise<boolean>;
  abstract existsSpecial(
    beneficientId: string,
    collectorId: string,
    month: number,
    year: number,
  ): Promise<boolean>;
  abstract findById(id: string): Promise<Receipt | null>;
  abstract findAllForPrint(
    filters: PrintReceiptFilters,
  ): Promise<ReceiptSchema[]>;
  abstract findByFolioRange(
    filters: PrintReceiptRangeFilters,
  ): Promise<ReceiptSchema[]>;
  abstract findOverdueUnpaid(
    beforeMonth: number,
    beforeYear: number,
    collectorNumber?: number,
  ): Promise<ReceiptSchema[]>;
  abstract findAll(): Promise<Receipt[]>;
  abstract findByFolio(folio: string): Promise<Receipt | null>;
  abstract findByFolios(folios: string[]): Promise<Receipt[]>;
  abstract findByCollectionPeriodId(periodId: string): Promise<Receipt[]>;
  abstract findPaidByCollectionPeriodId(
    periodId: string,
  ): Promise<ReceiptSchema[]>;
  abstract findPendingByCollectionPeriodId(
    periodId: string,
  ): Promise<ReceiptSchema[]>;
}
