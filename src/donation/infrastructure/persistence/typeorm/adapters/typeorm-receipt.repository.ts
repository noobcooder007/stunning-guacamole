import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { Receipt } from '@/donation/domain/aggregates/receipt.aggregate';
import { ReceiptMapper } from '../../mappers/receipt.mapper';

@Injectable()
export class TypeORMReceiptRepository
  extends BaseRepository<ReceiptSchema>
  implements IReceiptRepository
{
  constructor(datasource: DataSource) {
    super(datasource, ReceiptSchema);
  }

  async save(receipt: Receipt | Receipt[]): Promise<void> {
    if (Array.isArray(receipt)) {
      const receiptsToSave = receipt.map((r) => ReceiptMapper.toPersistence(r));
      await this.repository.save(receiptsToSave);
    } else {
      const receiptToSave = ReceiptMapper.toPersistence(receipt);
      await this.repository.save(receiptToSave);
    }
  }

  exists(
    promiseDonationId: string,
    month: number,
    year: number,
  ): Promise<boolean> {
    const exists = this.repository.exists({
      where: {
        promiseDonationId,
        periodMonth: month,
        periodYear: year,
      },
    });
    return exists;
  }

  async findById(id: string): Promise<Receipt | null> {
    const receipt = await this.repository.findOne({ where: { id } });
    if (!receipt) return null;
    return ReceiptMapper.toDomain(receipt);
  }

  async findAllPendingByCollectorId(
    collectorId: string,
  ): Promise<ReceiptSchema[]> {
    const receipts = await this.repository.find({
      where: {
        collectorId,
        status: 'PENDING',
      },
      relations: {
        promiseDonation: true,
        beneficient: true,
        collector: true,
      },
    });
    return receipts;
  }

  async findByFolios(folios: string[]): Promise<Receipt[]> {
    const receipts = await this.repository.find({
      where: {
        folio: In(folios),
      },
    });
    return receipts.map((receipt) => ReceiptMapper.toDomain(receipt));
  }
}
