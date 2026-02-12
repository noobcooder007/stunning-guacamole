import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IErrorResult, Result } from '@/shared/domain/dto/result.dto';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ActiveAssignationsResponse } from '@/community/application/dto/active-assignations.response';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { OrphansAssignationsResponse } from '@/community/application/dto/orphans-assignations.response';

@Injectable()
export class AssignationQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async getActivesWithBeneficients(
    collectorId: string,
  ): Promise<Result<ActiveAssignationsResponse[], IErrorResult>> {
    const qb = this.getQueryBuilder(AssignationSchema, 'assignation')
      .where('assignation.collectorId = :collectorId', { collectorId })
      .andWhere('assignation.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('assignation.beneficient', 'beneficient');
    const assignations = await qb.getMany();
    const response = assignations.map((assignation) => {
      return {
        id: assignation.id,
        beneficient: {
          id: assignation.beneficient.id,
          fullname: `${assignation.beneficient.firstname} ${assignation.beneficient.firstLastname} ${assignation.beneficient.secondLastname}`,
        },
        reasonDeactivated: assignation.reasonDeactivated,
      } as ActiveAssignationsResponse;
    });
    return Result.ok(response);
  }

  async getOrphans(): Promise<
    Result<OrphansAssignationsResponse[], IErrorResult>
  > {
    const qb = this.getQueryBuilder(AssignationSchema, 'a');
    qb.leftJoinAndSelect('a.collector', 'b')
      .leftJoinAndSelect('a.beneficient', 'c')
      .select([
        'a.id',
        'a.isActive',
        'b.firstname',
        'b.firstLastname',
        'b.secondLastname',
        'c.firstname',
        'c.firstLastname',
        'c.secondLastname',
        'a.reasonDeactivated',
      ])
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
    const assignations = await qb.getRawMany();
    const response = assignations.map((assignation) => {
      return {
        id: assignation.id,
        beneficient: {
          id: assignation.beneficient.id,
          fullname: `${assignation.beneficient.firstname} ${assignation.beneficient.firstLastname} ${assignation.beneficient.secondLastname}`,
        },
        lastCollector: {
          id: assignation.collector.id,
          fullname: `${assignation.collector.firstname} ${assignation.collector.firstLastname} ${assignation.collector.secondLastname}`,
        },
        reasonDeactivated: assignation.reasonDeactivated,
      } as OrphansAssignationsResponse;
    });
    return Result.ok(response);
  }
}
