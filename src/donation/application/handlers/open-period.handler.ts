import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { OpenPeriodCommand } from '@/donation/application/command/open-period.command';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { CollectionPeriod } from '@/donation/domain/aggregates/collection-period.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { UnitOfWork } from '@/database/unit-of-work';
import { PeriodResponseDto } from '@/donation/application/dto/period.response.dto';

function nextMonthYear(month: number, year: number): [number, number] {
  return month === 12 ? [1, year + 1] : [month + 1, year];
}

@CommandHandler(OpenPeriodCommand)
export class OpenPeriodHandler extends BaseCommandHandler<
  OpenPeriodCommand,
  PeriodResponseDto
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    private readonly uow: UnitOfWork,
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

    const scheduledPeriod = await this.periodRepository.findScheduled();
    let period: CollectionPeriod;

    if (scheduledPeriod) {
      period = scheduledPeriod;
      period.activate();
    } else {
      const lastClosed = await this.periodRepository.findLastClosed();
      if (!lastClosed) {
        return Result.fail({
          type: ErrorType.NOT_FOUND,
          message:
            'No closed period found. Close the current period before opening a new one',
          entity: OpenPeriodHandler.name,
        });
      }
      const [month, year] = nextMonthYear(lastClosed.month, lastClosed.year);
      period = CollectionPeriod.open(month, year, UserId.of(command.userId));
    }

    const [scheduleMonth, scheduleYear] = nextMonthYear(
      period.month,
      period.year,
    );
    const nextScheduled = CollectionPeriod.schedule(
      scheduleMonth,
      scheduleYear,
      UserId.of(command.userId),
    );

    await this.uow.runInTransaction(async () => {
      await this.periodRepository.save(period);

      if (scheduledPeriod) {
        const scheduledReceipts = (
          await this.receiptRepository.findByCollectionPeriodId(
            period._id.unpack(),
          )
        ).filter((r) => r.status === 'SCHEDULED');
        for (const receipt of scheduledReceipts) {
          receipt.markAsPending();
        }
        if (scheduledReceipts.length > 0) {
          await this.receiptRepository.save(scheduledReceipts);
        }
      }

      await this.periodRepository.save(nextScheduled);
    });

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
