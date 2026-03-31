import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Result,
  IErrorResult,
  ErrorType,
} from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { DeactivateBeneficientCommand } from '@/community/application/command/deactivate-beneficient.command';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';

@CommandHandler(DeactivateBeneficientCommand)
export class DeactivateBeneficientHanlder extends BaseCommandHandler<DeactivateBeneficientCommand> {
  constructor(
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    private readonly publisher: EventPublisher,
  ) {
    super();
  }

  protected async process(
    command: DeactivateBeneficientCommand,
  ): Promise<Result<any, IErrorResult>> {
    const beneficient = await this.beneficientRepository.findById(
      command.beneficientId,
    );
    if (!beneficient) {
      return Result.fail({
        message: 'Beneficient not found',
        entity: Beneficient.name,
        type: ErrorType.NOT_FOUND,
      });
    }
    const publisher = this.publisher.mergeObjectContext(beneficient);
    beneficient.deactivate(command.reason);
    this.beneficientRepository.save(beneficient);
    publisher.commit();
    return Result.ok(null);
  }
}
