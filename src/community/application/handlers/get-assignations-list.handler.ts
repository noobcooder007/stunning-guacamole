import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { GetAssignationsListQuery } from '@/community/application/query/get-assignations-list.query';
import { ActiveAssignationsResponse } from '@/community/application/dto/active-assignations.response';
import { AssignationQueryService } from '@/community/infrastructure/service/assignation.query.service';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetAssignationsListQuery)
export class GetAssignationsListHandler extends BaseQueryHandler<
  GetAssignationsListQuery,
  ActiveAssignationsResponse[]
> {
  constructor(
    public readonly datasource: DataSource,
    private readonly assignationsService: AssignationQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetAssignationsListQuery,
  ): Promise<Result<ActiveAssignationsResponse[]>> {
    const items = await this.assignationsService.getActivesList(query.collectorId);
    return Result.ok(items);
  }
}
