import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, IErrorResult, ErrorType } from '@/shared/domain/dto/result.dto';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import {
  UpdatePromiseDonationAmountCommand,
  UpdatePromiseDonationRecurrenceCommand,
  UpdatePromiseDonationInstructionsCommand,
} from '@/donation/application/command/update-promise-donation.command';

async function findActivePromise(
  repo: IPromiseDonationRepository,
  id: string,
): Promise<{ promise: PromiseDonation | null; error: IErrorResult | null }> {
  const promise = await repo.findById(id);
  if (!promise) {
    return { promise: null, error: { message: 'Promise donation not found', entity: PromiseDonation.name, type: ErrorType.NOT_FOUND } };
  }
  if (!promise.isActive) {
    return { promise: null, error: { message: 'Promise donation is not active', entity: PromiseDonation.name, type: ErrorType.CONFLICT } };
  }
  return { promise, error: null };
}

@CommandHandler(UpdatePromiseDonationAmountCommand)
export class UpdatePromiseDonationAmountHandler
  implements ICommandHandler<UpdatePromiseDonationAmountCommand>
{
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly repo: IPromiseDonationRepository,
  ) {}

  async execute(command: UpdatePromiseDonationAmountCommand): Promise<Result<void, IErrorResult>> {
    const { promise, error } = await findActivePromise(this.repo, command.id);
    if (error) return Result.fail(error);
    promise.updateAmount(command.promiseAmount, command.currency);
    await this.repo.save(promise);
    return Result.ok();
  }
}

@CommandHandler(UpdatePromiseDonationRecurrenceCommand)
export class UpdatePromiseDonationRecurrenceHandler
  implements ICommandHandler<UpdatePromiseDonationRecurrenceCommand>
{
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly repo: IPromiseDonationRepository,
  ) {}

  async execute(command: UpdatePromiseDonationRecurrenceCommand): Promise<Result<void, IErrorResult>> {
    const { promise, error } = await findActivePromise(this.repo, command.id);
    if (error) return Result.fail(error);
    promise.updateRecurrence(command.recurrence);
    await this.repo.save(promise);
    return Result.ok();
  }
}

@CommandHandler(UpdatePromiseDonationInstructionsCommand)
export class UpdatePromiseDonationInstructionsHandler
  implements ICommandHandler<UpdatePromiseDonationInstructionsCommand>
{
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly repo: IPromiseDonationRepository,
  ) {}

  async execute(command: UpdatePromiseDonationInstructionsCommand): Promise<Result<void, IErrorResult>> {
    const { promise, error } = await findActivePromise(this.repo, command.id);
    if (error) return Result.fail(error);
    promise.updateInstructions(command.instructions);
    await this.repo.save(promise);
    return Result.ok();
  }
}
