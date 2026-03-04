import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import {
  Result,
  IErrorResult,
  ErrorType,
} from '@/shared/domain/dto/result.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { DeactivatePromiseDonationCommand } from '@/donation/application/command/deactivate-promise-donation.command';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';

@CommandHandler(DeactivatePromiseDonationCommand)
export class DeactivatePromiseDonationHandler extends BaseCommandHandler<
  DeactivatePromiseDonationCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationRepository: IPromiseDonationRepository,
  ) {
    super();
  }

  protected async process(
    command: DeactivatePromiseDonationCommand,
  ): Promise<Result<void, IErrorResult>> {
    const { id, reason } = command;
    const promiseDonation = await this.promiseDonationRepository.findById(id);
    if (!promiseDonation) {
      return Result.fail({
        message: 'Promise donation not found',
        entity: PromiseDonation.name,
        type: ErrorType.NOT_FOUND,
      });
    }
    promiseDonation.deactivate(reason);
    await this.promiseDonationRepository.save(promiseDonation);
    return Result.ok();
  }
}
