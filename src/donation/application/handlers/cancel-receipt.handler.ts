import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { CancelReceiptCommand } from '@/donation/application/command/cancel-receipt.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';

@CommandHandler(CancelReceiptCommand)
export class CancelReceiptCommandHandler extends BaseCommandHandler<CancelReceiptCommand> {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
  ) {
    super();
  }

  protected async process(
    command: CancelReceiptCommand,
  ): Promise<Result<any, IErrorResult>> {
    const receipt = await this.receiptRepository.findById(command.receiptId);
    if (!receipt) return Result.ok(null);
    receipt.cancel(command.reason, command.userId);
    await this.receiptRepository.save(receipt);
    return Result.ok(receipt.folio.unpack());
  }
}
