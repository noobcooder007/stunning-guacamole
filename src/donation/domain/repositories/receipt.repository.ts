import { Injectable } from '@nestjs/common';
import { Receipt } from '@/donation/domain/aggregates/receipt.aggregate';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';

export type PrintReceiptType = 'RECURRING' | 'SPECIAL';

export interface PrintReceiptFilters {
  month?: number;
  year?: number;
  firstname?: string;
  firstLastname?: string;
  secondLastname?: string;
  collectorNumber?: number;
  type?: PrintReceiptType;
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
  abstract findPrintedOnceByPeriod(
    month: number,
    year: number,
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
