import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import {
  Result,
  IErrorResult,
  ErrorType,
} from '@/shared/domain/dto/result.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ReactivatePromiseDonationCommand } from '@/donation/application/command/reactivate-promise-donation.command';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';

@CommandHandler(ReactivatePromiseDonationCommand)
export class ReactivatePromiseDonationHandler extends BaseCommandHandler<
  ReactivatePromiseDonationCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationRepository: IPromiseDonationRepository,
  ) {
    super();
  }

  protected async process(
    command: ReactivatePromiseDonationCommand,
  ): Promise<Result<void, IErrorResult>> {
    const promiseDonation = await this.promiseDonationRepository.findById(
      command.id,
    );
    if (!promiseDonation) {
      return Result.fail({
        message: 'Promise donation not found',
        entity: PromiseDonation.name,
        type: ErrorType.NOT_FOUND,
      });
    }
    if (promiseDonation.isActive) {
      return Result.fail({
        message: 'Promise donation is already active',
        entity: PromiseDonation.name,
        type: ErrorType.CONFLICT,
      });
    }
    promiseDonation.reactivate();
    await this.promiseDonationRepository.save(promiseDonation);
    return Result.ok();
  }
}
