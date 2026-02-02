import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { BeneficientMapper } from '@/community/infrastructure/persistence/mappers/beneficient.mapper';
import { IBeneficientRepository } from '@/community/application/repositories/beneficient.repository';
import { IChurchRepository } from '@/community/application/repositories/church.repository';
import { CreateBeneficientResponse } from '@/community/application/dto/create-beneficient.response';

@CommandHandler(CreateBeneficientCommand)
export class CreateBeneficientHandler extends BaseCommandHandler<
  CreateBeneficientCommand,
  CreateBeneficientResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
  ) {
    super();
  }

  protected async process(
    command: CreateBeneficientCommand,
  ): Promise<Result<CreateBeneficientResponse>> {
    const beneficient = BeneficientMapper.commandToDomain(command);
    const [church, exists] = await Promise.all([
      this.churchRepository.findById(command.churchId),
      this.beneficientRepository.exists(beneficient),
    ]);
    if (!church) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The church was not found',
        entity: CreateBeneficientHandler.name,
      });
    }
    if (exists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'The beneficient already exists',
        entity: CreateBeneficientHandler.name,
      });
    }
    await this.beneficientRepository.save(beneficient);
    return Result.ok({
      id: beneficient._id.unpack(),
    });
  }
}
