import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ActiveAssignationsResponse } from '@/community/application/dto/active-assignations.response';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { OrphansAssignationsResponse } from '@/community/application/dto/orphans-assignations.response';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { AssignationMapper } from '../persistence/mappers/assignation.mapper';
import { GetActiveAssignationsQuery } from '@/community/application/query/get-active-assignations.query';

@Injectable()
export class AssignationQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getActivesWithBeneficients(
    query: GetActiveAssignationsQuery,
  ): Promise<Paginated<ActiveAssignationsResponse>> {
    const { page, limit, collectorId } = query;
    const qb = this.getQueryBuilder(AssignationSchema, 'assignation')
      .where('assignation.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('assignation.beneficient', 'beneficient')
      .leftJoinAndSelect('assignation.collector', 'collector');
    if (collectorId) {
      qb.andWhere('assignation.collectorId = :collectorId', { collectorId });
    }
    this.applyPagination(qb, page, limit);
    const [assignations, total] = await qb.getManyAndCount();
    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(
      assignations.map((item) => AssignationMapper.toResponse(item)),
      meta,
    );
  }

  async getOrphans(): Promise<OrphansAssignationsResponse[]> {
    const qb = this.getQueryBuilder(AssignationSchema, 'a')
      .leftJoinAndSelect('a.collector', 'b')
      .leftJoinAndSelect('a.beneficient', 'c')
      .andWhere((subQuery) => {
        const sub = subQuery
          .subQuery()
          .select('1')
          .from(AssignationSchema, 'sub')
          .where('sub.beneficientId = a.beneficientId')
          .andWhere('sub.isActive = :isActive', { isActive: true })
          .getQuery();
        return `NOT EXISTS (${sub})`;
      })
      .distinctOn(['a.beneficientId'])
      .orderBy('a.beneficientId', 'ASC')
      .addOrderBy('a.updatedAt', 'DESC');
    const assignations = await qb.getMany();
    return assignations.map((assignation) => ({
      id: assignation.id,
      beneficient: {
        id: assignation.beneficient.id,
        firstname: assignation.beneficient.firstname,
        firstLastname: assignation.beneficient.firstLastname,
        secondLastname: assignation.beneficient.secondLastname,
      },
      lastCollector: {
        id: assignation.collector.id,
        firstname: assignation.collector.firstname,
        firstLastname: assignation.collector.firstLastname,
        secondLastname: assignation.collector.secondLastname,
      },
      reasonDeactivated: assignation.reasonDeactivated,
    }));
  }
}
