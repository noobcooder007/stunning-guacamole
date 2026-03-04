import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import {
  Result,
  IErrorResult,
  ErrorType,
} from '@/shared/domain/dto/result.dto';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { CreatePromiseDonationCommand } from '@/donation/application/command/create-promise-donation.command';
import { CreatePromiseDonationResponse } from '@/donation/application/dto/create-promise-donation.response';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';

@CommandHandler(CreatePromiseDonationCommand)
export class CreatePromiseDonationHandler extends BaseCommandHandler<
  CreatePromiseDonationCommand,
  CreatePromiseDonationResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationRepository: IPromiseDonationRepository,
  ) {
    super();
  }

  protected async process(
    command: CreatePromiseDonationCommand,
  ): Promise<Result<CreatePromiseDonationResponse, IErrorResult>> {
    const promiseDonation = PromiseDonation.create({
      beneficientId: BeneficientId.of(command.beneficientId),
      promiseAmount: command.promiseAmount,
      currency: command.currency,
      method: command.method,
      startDate: command.startDate,
      recurring: command.recurring,
      recurrence: command.recurrence,
      createdBy: UserId.of(command.createdBy),
    });
    const exists = await this.promiseDonationRepository.exists(
      command.beneficientId,
    );
    if (exists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'Promise donation already exists',
        entity: 'PromiseDonation',
      });
    }
    await this.promiseDonationRepository.save(promiseDonation);
    const response = new CreatePromiseDonationResponse();
    response.id = promiseDonation._id.unpack();
    return Result.ok(response);
  }
}
