import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import {
  IReceiptRepository,
  PrintReceiptFilters,
  PrintReceiptRangeFilters,
} from '@/donation/domain/repositories/receipt.repository';
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

  existsSpecial(
    beneficientId: string,
    collectorId: string,
    month: number,
    year: number,
  ): Promise<boolean> {
    return this.repository.exists({
      where: {
        type: 'SPECIAL',
        status: 'PENDING',
        beneficientId,
        collectorId,
        periodMonth: month,
        periodYear: year,
      },
    });
  }

  async findById(id: string): Promise<Receipt | null> {
    const receipt = await this.repository.findOne({ where: { id } });
    if (!receipt) return null;
    return ReceiptMapper.toDomain(receipt);
  }

  async findAllForPrint(
    filters: PrintReceiptFilters,
  ): Promise<ReceiptSchema[]> {
    const qb = this.repository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.promiseDonation', 'pd')
      .leftJoinAndSelect('r.beneficient', 'b')
      .leftJoinAndSelect('b.profile', 'bProfile')
      .leftJoinAndSelect('r.collector', 'c')
      .leftJoinAndSelect('c.profile', 'cProfile')
      // Pendiente o pagado se puede imprimir/reimprimir igual: el printCount
      // y la marca de agua distinguen el original de una reimpresión.
      .where('r.status != :status', { status: 'CANCELLED' });

    if (filters.collectorId) {
      qb.andWhere('r.collectorId = :collectorId', {
        collectorId: filters.collectorId,
      });
    }
    if (filters.collectorNumber) {
      qb.andWhere('c.collectorNumber = :collectorNumber', {
        collectorNumber: filters.collectorNumber,
      });
    }
    if (filters.firstname) {
      qb.andWhere('cProfile.firstname ILIKE :firstname', {
        firstname: `%${filters.firstname}%`,
      });
    }
    if (filters.firstLastname) {
      qb.andWhere('cProfile.firstLastname ILIKE :firstLastname', {
        firstLastname: `%${filters.firstLastname}%`,
      });
    }
    if (filters.secondLastname) {
      qb.andWhere('cProfile.secondLastname ILIKE :secondLastname', {
        secondLastname: `%${filters.secondLastname}%`,
      });
    }
    if (filters.month) {
      qb.andWhere('r.periodMonth = :month', { month: filters.month });
    }
    if (filters.year) {
      qb.andWhere('r.periodYear = :year', { year: filters.year });
    }
    if (filters.type) {
      qb.andWhere('r.type = :type', { type: filters.type });
    }
    if (filters.folio) {
      qb.andWhere('r.folio = :folio', { folio: filters.folio });
    }

    qb.orderBy('c.collectorNumber', 'ASC')
      .addOrderBy('r.periodYear', 'ASC')
      .addOrderBy('r.periodMonth', 'ASC')
      .addOrderBy('bProfile.firstLastname', 'ASC')
      .addOrderBy('bProfile.firstname', 'ASC');

    return qb.getMany();
  }

  async findByFolioRange(
    filters: PrintReceiptRangeFilters,
  ): Promise<ReceiptSchema[]> {
    const qb = this.repository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.promiseDonation', 'pd')
      .leftJoinAndSelect('r.beneficient', 'b')
      .leftJoinAndSelect('b.profile', 'bProfile')
      .leftJoinAndSelect('r.collector', 'c')
      .leftJoinAndSelect('c.profile', 'cProfile')
      // Pendiente o pagado se puede imprimir/reimprimir igual: el printCount
      // y la marca de agua distinguen el original de una reimpresión.
      .where('r.status != :status', { status: 'CANCELLED' })
      .andWhere('r.type = :type', { type: 'RECURRING' })
      .andWhere('r.periodMonth = :month', { month: filters.month })
      .andWhere('r.periodYear = :year', { year: filters.year })
      .andWhere(
        "CAST(SPLIT_PART(r.folio, '-', 4) AS INTEGER) BETWEEN :fromSequence AND :toSequence",
        { fromSequence: filters.fromSequence, toSequence: filters.toSequence },
      );

    if (filters.collectorId) {
      qb.andWhere('r.collectorId = :collectorId', {
        collectorId: filters.collectorId,
      });
    }
    if (filters.collectorNumber) {
      qb.andWhere('c.collectorNumber = :collectorNumber', {
        collectorNumber: filters.collectorNumber,
      });
    }
    if (filters.firstname) {
      qb.andWhere('cProfile.firstname ILIKE :firstname', {
        firstname: `%${filters.firstname}%`,
      });
    }
    if (filters.firstLastname) {
      qb.andWhere('cProfile.firstLastname ILIKE :firstLastname', {
        firstLastname: `%${filters.firstLastname}%`,
      });
    }
    if (filters.secondLastname) {
      qb.andWhere('cProfile.secondLastname ILIKE :secondLastname', {
        secondLastname: `%${filters.secondLastname}%`,
      });
    }

    qb.orderBy('c.collectorNumber', 'ASC').addOrderBy('r.folio', 'ASC');

    return qb.getMany();
  }

  async findOverdueUnpaid(
    beforeMonth: number,
    beforeYear: number,
    collectorNumber?: number,
  ): Promise<ReceiptSchema[]> {
    const qb = this.repository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.promiseDonation', 'pd')
      .leftJoinAndSelect('r.beneficient', 'b')
      .leftJoinAndSelect('b.profile', 'bProfile')
      .leftJoinAndSelect('r.collector', 'c')
      .leftJoinAndSelect('c.profile', 'cProfile')
      .where('r.status = :status', { status: 'PENDING' })
      .andWhere(
        '(r.periodYear < :beforeYear OR (r.periodYear = :beforeYear AND r.periodMonth < :beforeMonth))',
        { beforeYear, beforeMonth },
      );

    if (collectorNumber) {
      qb.andWhere('c.collectorNumber = :collectorNumber', { collectorNumber });
    }

    qb.orderBy('c.collectorNumber', 'ASC')
      .addOrderBy('r.periodYear', 'ASC')
      .addOrderBy('r.periodMonth', 'ASC')
      .addOrderBy('bProfile.firstLastname', 'ASC')
      .addOrderBy('bProfile.firstname', 'ASC');

    return qb.getMany();
  }

  async findAll(): Promise<Receipt[]> {
    const receipts = await this.repository.find();
    return receipts.map((r) => ReceiptMapper.toDomain(r));
  }

  async findByFolio(folio: string): Promise<Receipt | null> {
    const receipt = await this.repository.findOne({ where: { folio } });
    if (!receipt) return null;
    return ReceiptMapper.toDomain(receipt);
  }

  async findByFolios(folios: string[]): Promise<Receipt[]> {
    const receipts = await this.repository.find({
      where: {
        folio: In(folios),
      },
    });
    return receipts.map((receipt) => ReceiptMapper.toDomain(receipt));
  }

  async findByCollectionPeriodId(periodId: string): Promise<Receipt[]> {
    const receipts = await this.repository.find({
      where: { collectionPeriodId: periodId },
    });
    return receipts.map((receipt) => ReceiptMapper.toDomain(receipt));
  }

  async findPaidByCollectionPeriodId(
    periodId: string,
  ): Promise<ReceiptSchema[]> {
    return this.repository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.beneficient', 'b')
      .leftJoinAndSelect('b.profile', 'bProfile')
      .leftJoinAndSelect('r.collector', 'c')
      .leftJoinAndSelect('c.profile', 'cProfile')
      .leftJoinAndSelect('r.promiseDonation', 'pd')
      .where('r.collectionPeriodId = :periodId', { periodId })
      .andWhere('r.status = :status', { status: 'PAID' })
      .orderBy('c.collectorNumber', 'ASC')
      .addOrderBy('bProfile.firstLastname', 'ASC')
      .getMany();
  }

  async findPendingByCollectionPeriodId(
    periodId: string,
  ): Promise<ReceiptSchema[]> {
    return this.repository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.beneficient', 'b')
      .leftJoinAndSelect('b.profile', 'bProfile')
      .leftJoinAndSelect('r.collector', 'c')
      .leftJoinAndSelect('c.profile', 'cProfile')
      .leftJoinAndSelect('r.promiseDonation', 'pd')
      .where('r.collectionPeriodId = :periodId', { periodId })
      .andWhere('r.status = :status', { status: 'PENDING' })
      .orderBy('c.collectorNumber', 'ASC')
      .addOrderBy('bProfile.firstLastname', 'ASC')
      .addOrderBy('r.periodYear', 'ASC')
      .addOrderBy('r.periodMonth', 'ASC')
      .getMany();
  }
}
