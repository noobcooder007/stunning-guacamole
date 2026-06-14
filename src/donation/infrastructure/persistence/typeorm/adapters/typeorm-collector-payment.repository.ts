import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ICollectorPaymentRepository } from '@/donation/domain/repositories/collector-payment.repository';
import { CollectorPayment } from '@/donation/domain/entities/collector-payment.entity';
import { CollectorPaymentSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collector-payment.schema';
import { CollectorPaymentMapper } from '@/donation/infrastructure/persistence/mappers/collector-payment.mapper';

@Injectable()
export class TypeORMCollectorPaymentRepository
  extends BaseRepository<CollectorPaymentSchema>
  implements ICollectorPaymentRepository
{
  constructor(datasource: DataSource) {
    super(datasource, CollectorPaymentSchema);
  }

  async save(payment: CollectorPayment): Promise<void> {
    await this.repository.save(CollectorPaymentMapper.toPersistence(payment));
  }

  async saveMany(payments: CollectorPayment[]): Promise<void> {
    const rows = payments.map((p) => CollectorPaymentMapper.toPersistence(p));
    await this.repository.save(rows);
  }

  async findBySettlementId(settlementId: string): Promise<CollectorPayment[]> {
    const rows = await this.repository.find({
      where: { settlementId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((r) => CollectorPaymentMapper.toDomain(r));
  }
}
