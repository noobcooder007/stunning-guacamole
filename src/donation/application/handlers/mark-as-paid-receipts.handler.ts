import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { MarkAsPaidReceiptsCommand } from '@/donation/application/command/mark-as-paid-receipts.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';

@CommandHandler(MarkAsPaidReceiptsCommand)
export class MarkAsPaidReceiptsCommandHandler extends BaseCommandHandler<MarkAsPaidReceiptsCommand> {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: MarkAsPaidReceiptsCommand,
  ): Promise<Result<any, IErrorResult>> {
    const receipts = await this.receiptRepository.findByFolios(
      Array.from(command.receipts.map((receipt) => receipt.receiptFolio)),
    );
    if (!receipts) return Result.ok(null);
    const receiptsPaid = [];
    await this.uow.runInTransaction(async () => {
      receipts.forEach((receipt) => {
        const receiptMeta = command.receipts.find(
          (r) => r.receiptFolio === receipt.folio.unpack(),
        );
        receipt.markAsPaid(
          receiptMeta.paymentMethod as 'CASH' | 'TRANSFER' | 'CARD',
          receiptMeta.externalReference,
        );
        receiptsPaid.push(receipt.folio.unpack());
      });
      await this.receiptRepository.save(receipts);
    });
    return Result.ok(receiptsPaid);
  }
}
