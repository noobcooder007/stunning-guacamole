import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { ValidateReceiptQuery } from '@/donation/application/query/validate-receipt.query';
import { ValidateReceiptResponseDto } from '@/donation/application/dto/validate-receipt.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(ValidateReceiptQuery)
export class ValidateReceiptHandler implements IQueryHandler<
  ValidateReceiptQuery,
  Result<ValidateReceiptResponseDto>
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
  ) {}

  async execute(
    query: ValidateReceiptQuery,
  ): Promise<Result<ValidateReceiptResponseDto>> {
    const receipt = await this.receiptRepository.findByFolio(query.folio);
    if (!receipt || !receipt.chainValidator) {
      return Result.ok({ valid: false });
    }

    const id = receipt._id.unpack();
    const folio = receipt.folio.unpack();
    const rawAmount = receipt.amount.unpack().amount;
    const beneficientId = receipt.beneficient?.unpack() ?? null;

    // Try all legacy amount × beneficient combinations to support receipts
    // created before normalization: TypeORM decimal → string, undefined vs null
    const amountVariants: Array<number | string> = [
      Number(rawAmount),
      rawAmount,
    ];
    // When no beneficient: creation may have stored `undefined` (JS) or `null`
    const beneficientVariants =
      beneficientId === null ? [null, undefined] : [beneficientId];

    for (const amount of amountVariants) {
      for (const ben of beneficientVariants) {
        if (
          await this.matchesChain(
            receipt.chainValidator,
            id,
            folio,
            amount,
            ben,
          )
        ) {
          return Result.ok({
            valid: true,
            folio,
            status: receipt.status,
            amount: receipt.amount.amount,
            currency: receipt.amount.currency,
          });
        }
      }
    }

    return Result.ok({ valid: false });
  }

  private async matchesChain(
    stored: string,
    id: string,
    folio: string,
    amount: number | string,
    beneficient: string | null | undefined,
  ): Promise<boolean> {
    const data = `${id}|${folio}|${amount}|${beneficient}`;
    const hash = (await this.hasher.hash(data)).substring(0, 16).toUpperCase();
    return hash === stored;
  }
}
