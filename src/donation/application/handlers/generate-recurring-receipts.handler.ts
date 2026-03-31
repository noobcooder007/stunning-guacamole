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

@CommandHandler(GenerateRecurringReceiptsCommand)
export class GenerateRecurringReceiptsHandler implements ICommandHandler<GenerateRecurringReceiptsCommand> {
  constructor(
    private readonly promiseDonationService: PromiseDonationQueryService,
    @Inject(REPOSITORY_TOKENS.PROMISE_DONATION)
    private readonly promiseDonationRepository: IPromiseDonationRepository,
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    private readonly folioProvider: ReceiptFolioProvider,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(command: GenerateRecurringReceiptsCommand): Promise<void> {
    const now = new Date();
    await this.uow.runInTransaction(async () => {
      const promisesWithCollectorId =
        await this.promiseDonationService.searchWithActiveAssignments(
          now.getMonth() + 1,
          now.getFullYear(),
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
        const exists = await this.receiptRepository.exists(
          promise._id.unpack(),
          now.getMonth() + 1,
          now.getFullYear(),
        );
        if (exists) continue;
        const folio = await this.folioProvider.generateNext(
          promiseWithCollectorId.collectorId,
          'RECURRING',
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
        );
        receipt.generateValidationChain(this.hasher);
        promise.updateLastDonation();
        promise.updateNextDonation();
        await this.promiseDonationRepository.save(promise);
        await this.receiptRepository.save(receipt);
      }
    });
  }
}
