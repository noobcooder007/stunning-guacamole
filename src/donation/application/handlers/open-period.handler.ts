import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { OpenPeriodCommand } from '@/donation/application/command/open-period.command';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { CollectionPeriod } from '@/donation/domain/aggregates/collection-period.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PeriodResponseDto } from '@/donation/application/dto/period.response.dto';

@CommandHandler(OpenPeriodCommand)
export class OpenPeriodHandler extends BaseCommandHandler<
  OpenPeriodCommand,
  PeriodResponseDto
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
  ) {
    super();
  }

  protected async process(
    command: OpenPeriodCommand,
  ): Promise<Result<PeriodResponseDto>> {
    const existing = await this.periodRepository.findOpen();
    if (existing) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: `There is already an open period for ${existing.month}/${existing.year}`,
        entity: OpenPeriodHandler.name,
      });
    }

    const period = CollectionPeriod.open(
      command.month,
      command.year,
      UserId.of(command.userId),
    );
    await this.periodRepository.save(period);

    const response = new PeriodResponseDto();
    response.id = period._id.unpack();
    response.month = period.month;
    response.year = period.year;
    response.status = period.status;
    response.createdAt = period.createdAt;
    response.createdBy = period.createdBy.unpack();
    return Result.ok(response);
  }
}
