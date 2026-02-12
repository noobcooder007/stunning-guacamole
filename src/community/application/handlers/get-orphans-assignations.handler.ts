import { DataSource } from 'typeorm';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { AssignationQueryService } from '@/community/infrastructure/service/assignation.query.service';
import { GetOrphansAssignationsQuery } from '@/community/application/query/get-orphans-assignations.query';
import { OrphansAssignationsResponse } from '@/community/application/dto/orphans-assignations.response';
import { QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetOrphansAssignationsQuery)
export class GetOrphansAssignationsQueryHandler extends BaseQueryHandler<
  GetOrphansAssignationsQuery,
  OrphansAssignationsResponse[]
> {
  constructor(
    public readonly datasource: DataSource,
    private readonly assignationsService: AssignationQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    _query: GetOrphansAssignationsQuery,
  ): Promise<Result<OrphansAssignationsResponse[], IErrorResult>> {
    const response = await this.assignationsService.getOrphans();
    return response;
  }
}
