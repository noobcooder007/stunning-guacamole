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
    const openPeriod = await this.periodRepository.findOpen();
    if (openPeriod) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: `Period ${openPeriod.month}/${openPeriod.year} is still open. Close it before opening a new one`,
        entity: OpenPeriodHandler.name,
      });
    }

    const lastClosed = await this.periodRepository.findLastClosed();
    if (!lastClosed) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'No closed period found. Close the current period before opening a new one',
        entity: OpenPeriodHandler.name,
      });
    }

    const nextMonth = lastClosed.month === 12 ? 1 : lastClosed.month + 1;
    const nextYear = lastClosed.month === 12 ? lastClosed.year + 1 : lastClosed.year;

    const period = CollectionPeriod.open(
      nextMonth,
      nextYear,
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
