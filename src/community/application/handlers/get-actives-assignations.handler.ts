import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { GetActiveAssignationsQuery } from '@/community/application/query/get-active-assignations.query';
import { ActiveAssignationsResponse } from '@/community/application/dto/active-assignations.response';
import { AssignationQueryService } from '@/community/infrastructure/service/assignation.query.service';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetActiveAssignationsQuery)
export class GetActivesAssignationsHandler extends BaseQueryHandler<
  GetActiveAssignationsQuery,
  Paginated<ActiveAssignationsResponse>
> {
  constructor(
    public readonly datasource: DataSource,
    private readonly assignationsService: AssignationQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetActiveAssignationsQuery,
  ): Promise<Result<Paginated<ActiveAssignationsResponse>>> {
    const response = await this.assignationsService.getActivesWithBeneficients({
      page: query.page,
      limit: query.limit,
      collectorId: query.collectorId,
    });
    return Result.ok(response);
  }
}
