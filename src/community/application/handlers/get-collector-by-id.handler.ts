import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { CollectorResponse } from '@/community/application/dto/collector.response';
import { GetCollectorByIdQuery } from '@/community/application/query/get-collector-by-id.query';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';

@QueryHandler(GetCollectorByIdQuery)
export class GetCollectorByIdHandler extends BaseQueryHandler<
  GetCollectorByIdQuery,
  CollectorResponse
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetCollectorByIdQuery,
  ): Promise<Result<CollectorResponse>> {
    const collector = await this.collectorRepository.findById(query.id);
    if (!collector) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The church was not found',
        entity: GetCollectorByIdHandler.name,
      });
    }
    return Result.ok<CollectorResponse>(
      CollectorMapper.fromDomainToResponse(collector),
    );
  }
}
