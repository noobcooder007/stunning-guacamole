import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { BeneficientsReportItemDto } from '@/community/application/dto/beneficients-report.response';

@Injectable()
export class BeneficientsReportQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getAll(): Promise<BeneficientsReportItemDto[]> {
    return this._fetchAndMap();
  }

  async getReport(
    page: number,
    limit: number,
  ): Promise<Paginated<BeneficientsReportItemDto>> {
    const safeLimit = Math.max(limit, 1);
    const safePage = Math.max(page, 1);

    const [beneficients, total] = await this.getQueryBuilder(
      BeneficientSchema,
      'b',
    )
      .leftJoinAndSelect('b.promiseDonation', 'pd')
      .orderBy('b.beneficientNumber', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    if (beneficients.length === 0) {
      return new Paginated([], new PaginationMetaDto(page, limit, total));
    }

    const items = await this._mapBeneficients(beneficients);
    return new Paginated(items, new PaginationMetaDto(page, limit, total));
  }

  private async _fetchAndMap(): Promise<BeneficientsReportItemDto[]> {
    const beneficients = await this.getQueryBuilder(BeneficientSchema, 'b')
      .leftJoinAndSelect('b.promiseDonation', 'pd')
      .orderBy('b.beneficientNumber', 'ASC')
      .getMany();

    if (beneficients.length === 0) return [];
    return this._mapBeneficients(beneficients);
  }

  private async _mapBeneficients(
    beneficients: BeneficientSchema[],
  ): Promise<BeneficientsReportItemDto[]> {
    const ids = beneficients.map((b) => b.id);

    const [assignations, receiptCounts] = await Promise.all([
      this.getQueryBuilder(AssignationSchema, 'a')
        .leftJoinAndSelect('a.collector', 'c')
        .where('a.beneficientId IN (:...ids)', { ids })
        .andWhere('a.isActive = :isActive', { isActive: true })
        .getMany(),
      this.dataSource
        .createQueryBuilder()
        .select('r."beneficientId"', 'beneficientId')
        .addSelect('COUNT(*)::int', 'count')
        .addSelect('COALESCE(SUM(r.amount), 0)::decimal', 'total')
        .from(ReceiptSchema, 'r')
        .where('r."beneficientId" IN (:...ids)', { ids })
        .andWhere(`r.status != 'CANCELLED'`)
        .groupBy('r."beneficientId"')
        .getRawMany<{ beneficientId: string; count: number; total: string }>(),
    ]);

    const assignationMap = new Map(
      assignations.map((a) => [a.beneficientId, a]),
    );
    const countMap = new Map(
      receiptCounts.map((r) => [r.beneficientId, Number(r.count)]),
    );
    const totalMap = new Map(
      receiptCounts.map((r) => [r.beneficientId, Number(r.total)]),
    );

    return beneficients.map((b) => {
      const assignation = assignationMap.get(b.id);
      return {
        beneficientNumber: b.beneficientNumber,
        title: b.title,
        firstname: b.firstname,
        firstLastname: b.firstLastname,
        secondLastname: b.secondLastname ?? null,
        birthday: b.birthday,
        genre: b.genre,
        maritalStatus: b.maritalStatus,
        email: b.email ?? null,
        phoneNumber: b.phoneNumber ?? null,
        street: b.street,
        noExt: b.noExt,
        noInt: b.noInt ?? null,
        neighborhood: b.neighborhood ?? null,
        locality: b.locality ?? null,
        city: b.city,
        state: b.state,
        zipCode: b.zipCode,
        createdAt: b.createdAt,
        deactivatedAt: b.deactivatedAt ?? null,
        reasonDeactivated: b.reasonDeactivated ?? null,
        isActive: b.isActive,
        collectorNumber: assignation?.collector?.collectorNumber ?? null,
        collectorFirstname: assignation?.collector?.firstname ?? null,
        collectorFirstLastname: assignation?.collector?.firstLastname ?? null,
        donationCount: countMap.get(b.id) ?? 0,
        donationTotal: totalMap.get(b.id) ?? 0,
        promiseAmount: b.promiseDonation
          ? Number(b.promiseDonation.promiseAmount)
          : null,
        currency: b.promiseDonation?.currency ?? null,
        recurring: b.promiseDonation?.recurring ?? null,
        recurrence: b.promiseDonation?.recurrence ?? null,
        promiseIsActive: b.promiseDonation?.isActive ?? null,
      };
    });
  }
}
