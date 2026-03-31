import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ReceiptType } from '@/donation/domain/aggregates/receipt.aggregate';
import { IReceiptSequenceRepository } from '@/donation/domain/repositories/receipt-sequence.repository';
import { ReceiptSequenceSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt-sequence.schema';

@Injectable()
export class TypeORMReceiptSequenceRepository
  extends BaseRepository<ReceiptSequenceSchema>
  implements IReceiptSequenceRepository
{
  constructor(datasource: DataSource) {
    super(datasource, null);
  }

  async getNextSequenceWithLock(
    collectorId: string,
    type: ReceiptType,
    year: number,
  ): Promise<number> {
    let sequenceRecord = await this.manager
      .getRepository(ReceiptSequenceSchema)
      .findOne({
        where: {
          collectorId,
          type,
          year,
        },
        lock: { mode: 'pessimistic_write' },
      });

    if (!sequenceRecord) {
      sequenceRecord = await this.manager
        .getRepository(ReceiptSequenceSchema)
        .save({
          collectorId,
          type,
          year,
          lastValue: 1,
        });
      return 1;
    }

    const nextValue = sequenceRecord.lastValue + 1;
    sequenceRecord.lastValue = nextValue;

    await this.manager
      .getRepository(ReceiptSequenceSchema)
      .save(sequenceRecord);
    return nextValue;
    // const result = await this.dataSource
    //   .getRepository(ReceiptSequenceSchema)
    //   .query(
    //     `
    //     INSERT INTO receipt_sequences ("collectorId", type, year, "lastValue")
    //     VALUES ($1, $2, $3, 1)
    //     ON CONFLICT ("collectorId", type, year)
    //     DO UPDATE SET "lastValue" = receipt_sequences."lastValue" + 1
    //     RETURNING "lastValue";
    //     `,
    //     [collectorId, type, year],
    //   );

    // return result[0].lastValue;
  }

  async getCollectorShortCode(collectorId: string): Promise<string> {
    const collectorNumber = await this.manager
      .getRepository(CollectorSchema)
      .createQueryBuilder('collector')
      .select('collector.collectorNumber')
      .where('id = :id', { id: collectorId })
      .getOne();
    return collectorNumber.collectorNumber.toString().padStart(4, '0');
  }
}
