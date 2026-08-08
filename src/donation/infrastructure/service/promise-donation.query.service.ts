import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { PromiseDonationResponse } from '@/donation/application/dto/promise-donation.response.dto';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { GetPromiseDonationQueryParams } from '@/donation/application/query/get-promise-donation-paginated.query';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { GetPromiseDonationWithBeneficientsQueryParams } from '../../application/query/get-promise-donation-with-beneficients-paginated.query';
import { PromiseDonationWithBeneficientsResponse } from '../../application/dto/promise-donation-with-beneficients.response.dto';
import { PromiseDonationMapper } from '@/donation/infrastructure/persistence/mappers/promise-donation.mapper';

@Injectable()
export class PromiseDonationQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchPromiseDonations(
    query: GetPromiseDonationQueryParams,
  ): Promise<Paginated<PromiseDonationResponse>> {
    const { page, limit, ...filters } = query;
    const qb = this.getQueryBuilder(PromiseDonationSchema, 'promise');
    this.applyFilters(qb, 'promise', filters);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();

    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(items, meta);
  }

  async searchPromiseDonationsWithBeneficients(
    query: GetPromiseDonationWithBeneficientsQueryParams,
  ): Promise<Paginated<PromiseDonationWithBeneficientsResponse>> {
    const { page, limit, ...filters } = query;
    const qb = this.getQueryBuilder(PromiseDonationSchema, 'promise');
    qb.leftJoinAndSelect('promise.beneficient', 'beneficient');
    qb.leftJoinAndSelect('beneficient.profile', 'profile');
    // Filtrado en el ON (no en WHERE) para no descartar promesas cuyo
    // bienhechor no tenga una asignación activa (o ninguna asignación).
    qb.leftJoinAndSelect(
      'beneficient.assignation',
      'assignation',
      'assignation.isActive = true',
    );
    qb.leftJoinAndSelect('assignation.collector', 'collector');
    this.applyFilters(qb, 'promise', filters);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();

    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(
      items.map((item) =>
        PromiseDonationMapper.toResponseWithBeneficient(
          item,
          item.beneficient.assignation?.collector?.collectorNumber ?? null,
        ),
      ),
      meta,
    );
  }

  async searchWithActiveAssignments(
    month: number,
    year: number,
  ): Promise<any[]> {
    const promises = await this.dataSource
      .getRepository(PromiseDonationSchema)
      .createQueryBuilder('promise')
      .select(['promise.*'])
      .leftJoin(
        AssignationSchema,
        'assignation',
        'assignation.beneficientId = promise.beneficientId',
      )
      .addSelect('assignation.collectorId', 'collectorId')
      .where('promise.isActive = :isActive', { isActive: true })
      .andWhere('assignation.isActive = :isActive', { isActive: true })
      .andWhere('promise.nextDonation <= :lastDayOfMonth', {
        lastDayOfMonth: new Date(year, month, 0, 23, 59, 59),
      })
      .getRawMany();

    return promises;
  }
}
