import { DataSource } from 'typeorm';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { PromiseDonationResponse } from '@/donation/application/dto/promise-donation.response.dto';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { GetPromiseDonationQueryParams } from '@/donation/application/query/get-promise-donation-paginated.query';
import { Injectable } from '@nestjs/common';

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
}
