import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { GetBeneficientByIdQuery } from '@/community/application/query/get-beneficient-by-id.query';

@QueryHandler(GetBeneficientByIdQuery)
export class GetBeneficientByIdHandler extends BaseQueryHandler<
  GetBeneficientByIdQuery,
  BeneficientResponse
> {
  constructor(
    datasource: DataSource,
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetBeneficientByIdQuery,
  ): Promise<Result<BeneficientResponse>> {
    const beneficient = await this.beneficientRepository.findById(query.id);
    if (!beneficient) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The church was not found',
        entity: GetBeneficientByIdHandler.name,
      });
    }
    return Result.ok<BeneficientResponse>(
      BeneficientMapper.fromDomainToResponse(beneficient),
    );
  }
}
