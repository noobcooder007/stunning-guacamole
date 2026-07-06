import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { GenerateRecurringReceiptsCommand } from '@/donation/application/command/generate-recurring-receipts.command';
import { PromiseDonationQueryService } from '@/donation/infrastructure/service/promise-donation.query.service';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { Money, Receipt } from '@/donation/domain/aggregates/receipt.aggregate';
import { IPromiseDonationRepository } from '@/donation/domain/repositories/promise-donation.repository';
import { ReceiptFolioProvider } from '@/donation/infrastructure/service/receipt-folio.provider';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';

@CommandHandler(GenerateRecurringReceiptsCommand)
export class GenerateRecurringReceiptsHandler implements ICommandHandler<
  GenerateRecurringReceiptsCommand,
  Result<void>
> {
  constructor(
    private readonly promiseDonationService: PromiseDonationQueryService,
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationRepository: IPromiseDonationRepository,
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    private readonly folioProvider: ReceiptFolioProvider,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(
    command: GenerateRecurringReceiptsCommand,
  ): Promise<Result<void>> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastDayOfCurrentMonth = new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59,
    );

    const openPeriod = await this.periodRepository.findOpen();

    if (
      openPeriod &&
      (openPeriod.month !== currentMonth || openPeriod.year !== currentYear)
    ) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: `El periodo abierto corresponde a ${openPeriod.month}/${openPeriod.year}. No se pueden generar recibos de ${currentMonth}/${currentYear} hasta que inicie ese mes.`,
        entity: GenerateRecurringReceiptsHandler.name,
      });
    }

    const collectionPeriodId = openPeriod?._id.unpack();

    await this.uow.runInTransaction(async () => {
      const promisesWithCollectorId =
        await this.promiseDonationService.searchWithActiveAssignments(
          currentMonth,
          currentYear,
        );
      for (const promiseWithCollectorId of promisesWithCollectorId) {
        const promise = PromiseDonation.recreate(promiseWithCollectorId.id, {
          beneficientId: BeneficientId.of(promiseWithCollectorId.beneficientId),
          promiseAmount: promiseWithCollectorId.promiseAmount,
          currency: promiseWithCollectorId.currency,
          method: promiseWithCollectorId.method,
          startDate: promiseWithCollectorId.startDate,
          recurring: promiseWithCollectorId.recurring,
          recurrence: promiseWithCollectorId.recurrence,
          isActive: promiseWithCollectorId.isActive,
          reasonDeactivate: promiseWithCollectorId.reasonDeactivate,
          createdBy: UserId.of(promiseWithCollectorId.createdBy),
          createdAt: promiseWithCollectorId.createdAt,
          updatedAt: promiseWithCollectorId.updatedAt,
          lastDonation: promiseWithCollectorId.lastDonation,
          nextDonation: promiseWithCollectorId.nextDonation,
        });

        let promiseUpdated = false;

        while (
          promise.nextDonation &&
          promise.nextDonation <= lastDayOfCurrentMonth
        ) {
          const targetDate = new Date(promise.nextDonation);
          const targetMonth = targetDate.getMonth() + 1;
          const targetYear = targetDate.getFullYear();

          const exists = await this.receiptRepository.exists(
            promise._id.unpack(),
            targetMonth,
            targetYear,
          );

          if (!exists) {
            const folio = await this.folioProvider.generateNext(
              promiseWithCollectorId.collectorId,
              'RECURRING',
              targetDate,
            );
            const receipt = Receipt.createRecurring(
              folio,
              Money.of(
                promiseWithCollectorId.promiseAmount,
                promiseWithCollectorId.currency as 'MXN' | 'USD',
              ),
              promise._id,
              BeneficientId.of(promiseWithCollectorId.beneficientId),
              CollectorId.of(promiseWithCollectorId.collectorId),
              UserId.of(command.userId),
              promiseWithCollectorId.chainValidator,
              targetMonth,
              targetYear,
              collectionPeriodId,
            );
            await receipt.generateValidationChain(this.hasher);
            await this.receiptRepository.save(receipt);
          }

          promise.updateLastDonationTo(targetDate);
          promise.updateNextDonation();
          promiseUpdated = true;
        }

        if (promiseUpdated) {
          await this.promiseDonationRepository.save(promise);
        }
      }
    });

    return Result.ok();
  }
}
