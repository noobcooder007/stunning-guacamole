import { Injectable } from '@nestjs/common';
import { Receipt } from '@/donation/domain/aggregates/receipt.aggregate';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';

@Injectable()
export abstract class IReceiptRepository {
  abstract save(receipt: Receipt): Promise<void>;
  abstract save(receipt: Receipt[]): Promise<void>;
  abstract exists(
    promiseDonationId: string,
    month: number,
    year: number,
  ): Promise<boolean>;
  abstract findById(id: string): Promise<Receipt | null>;
  abstract findAllPendingByCollectorId(
    collectorId: string,
  ): Promise<ReceiptSchema[]>;
  abstract findByFolios(folios: string[]): Promise<Receipt[]>;
}
