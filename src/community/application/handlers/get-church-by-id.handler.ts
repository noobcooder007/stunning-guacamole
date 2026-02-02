import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { GetChurchByIdQuery } from '@/community/application/query/get-church-by-id.query';
import { ChurchMapper } from '@/community/infrastructure/persistence/mappers/church.mapper';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { ChurchResponse } from '@/community/application/dto/church.response';
import { DataSource } from 'typeorm';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@QueryHandler(GetChurchByIdQuery)
export class GetChurchByIdHandler extends BaseQueryHandler<
  GetChurchByIdQuery,
  ChurchResponse
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetChurchByIdQuery,
  ): Promise<Result<ChurchResponse>> {
    const church = await this.churchRepository.findById(query.id);
    if (!church) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The church was not found',
        entity: GetChurchByIdHandler.name,
      });
    }
    return Result.ok<ChurchResponse>(ChurchMapper.fromDomainToResponse(church));
  }
}
