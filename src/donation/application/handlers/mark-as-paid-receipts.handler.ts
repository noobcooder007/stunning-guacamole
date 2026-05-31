import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { MarkAsPaidReceiptsCommand } from '@/donation/application/command/mark-as-paid-receipts.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';

export interface PaidReceiptsResponse {
  currentPeriod: string[];
  previousPeriods: string[];
}

@CommandHandler(MarkAsPaidReceiptsCommand)
export class MarkAsPaidReceiptsCommandHandler extends BaseCommandHandler<
  MarkAsPaidReceiptsCommand,
  PaidReceiptsResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: MarkAsPaidReceiptsCommand,
  ): Promise<Result<PaidReceiptsResponse, IErrorResult>> {
    const [receipts, openPeriod] = await Promise.all([
      this.receiptRepository.findByFolios(
        command.receipts.map((r) => r.receiptFolio),
      ),
      this.periodRepository.findOpen(),
    ]);

    if (!receipts || receipts.length === 0) return Result.ok({ currentPeriod: [], previousPeriods: [] });

    const periodId = openPeriod?._id.unpack();
    const currentPeriodFolios: string[] = [];
    const previousPeriodFolios: string[] = [];

    await this.uow.runInTransaction(async () => {
      const toPay = receipts.filter((r) => r.status === 'PENDING');
      toPay.forEach((receipt) => {
        const meta = command.receipts.find(
          (r) => r.receiptFolio === receipt.folio.unpack(),
        );
        receipt.markAsPaid(
          meta.paymentMethod as 'CASH' | 'TRANSFER' | 'CARD',
          periodId,
          meta.externalReference,
        );

        const isCurrentPeriod =
          openPeriod &&
          receipt.periodMonth === openPeriod.month &&
          receipt.periodYear === openPeriod.year;

        if (isCurrentPeriod) {
          currentPeriodFolios.push(receipt.folio.unpack());
        } else {
          previousPeriodFolios.push(receipt.folio.unpack());
        }
      });
      if (toPay.length > 0) await this.receiptRepository.save(toPay);
    });

    return Result.ok<PaidReceiptsResponse>({
      currentPeriod: currentPeriodFolios,
      previousPeriods: previousPeriodFolios,
    });
  }
}
