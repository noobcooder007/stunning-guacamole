import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { IErrorResult, Result } from '@/shared/domain/dto/result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { GetActiveAssignationsQuery } from '@/community/application/query/get-active-assignations.query';
import { ActiveAssignationsResponse } from '@/community/application/dto/active-assignations.response';
import { AssignationQueryService } from '@/community/infrastructure/service/assignation.query.service';

@QueryHandler(GetActiveAssignationsQuery)
export class GetActivesAssignationsHandler extends BaseQueryHandler<
  GetActiveAssignationsQuery,
  ActiveAssignationsResponse[]
> {
  constructor(
    public readonly datasource: DataSource,
    private readonly assignationsService: AssignationQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetActiveAssignationsQuery,
  ): Promise<Result<ActiveAssignationsResponse[], IErrorResult>> {
    const response = await this.assignationsService.getActivesWithBeneficients(
      query.collectorId,
    );
    return response;
  }
}
