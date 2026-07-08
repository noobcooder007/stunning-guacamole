import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
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
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
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
        message: 'The beneficient was not found',
        entity: GetBeneficientByIdHandler.name,
      });
    }
    const church = await this.churchRepository.findById(
      beneficient.church.unpack(),
    );
    const response = BeneficientMapper.fromDomainToResponse(beneficient);
    response.church.ecclesialIdentity = church?.ecclesialIdentity ?? null;
    return Result.ok<BeneficientResponse>(response);
  }
}
