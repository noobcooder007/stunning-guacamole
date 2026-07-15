import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';
import { GetCollectorsActiveListQuery } from '@/community/application/query/get-collectors-active-list.query';
import { CollectorResponse } from '@/community/application/dto/collector.response';
import { CollectorListItemResponse } from '@/community/application/dto/collector-list-item.response';

@Injectable()
export class CollectorQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchCollectors(
    query: GetCollectorQueryParams,
  ): Promise<Paginated<CollectorResponse>> {
    const { page, limit, scopedCollectorId, ...filters } = query;
    const qb = this.getQueryBuilder(
      CollectorSchema,
      'collector',
    ).leftJoinAndSelect('collector.profile', 'profile');
    if (scopedCollectorId) {
      qb.andWhere('collector.id = :scopedCollectorId', { scopedCollectorId });
    }
    this.applyFilters(qb, 'profile', filters, ProfileSchema);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();

    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(
      items.map((item) => CollectorMapper.fromModelToResponse(item)),
      meta,
    );
  }

  async getActiveList(
    query: GetCollectorsActiveListQuery,
  ): Promise<CollectorListItemResponse[]> {
    const qb = this.getQueryBuilder(CollectorSchema, 'collector')
      .leftJoinAndSelect('collector.profile', 'profile')
      .where('collector.isActive = :isActive', { isActive: true });
    if (query.search) {
      query.search
        .trim()
        .split(/\s+/)
        .forEach((token, i) => {
          const param = `term${i}`;
          qb.andWhere(
            `(profile.firstname ILIKE :${param} OR profile.firstLastname ILIKE :${param} OR profile.secondLastname ILIKE :${param})`,
            { [param]: `%${token}%` },
          );
        });
    }
    const items = await qb.getMany();
    return items.map((item) => ({
      id: item.id,
      firstname: item.profile.firstname,
      firstLastname: item.profile.firstLastname,
      secondLastname: item.profile.secondLastname,
      collectorNumber: item.collectorNumber,
    }));
  }
}
