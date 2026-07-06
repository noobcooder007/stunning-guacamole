import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import {
  ErrorType,
  IErrorResult,
  Result,
} from '@/shared/domain/dto/result.dto';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { ReceiptMapper } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { ReceiptResponse } from '@/donation/application/dto/receipt.response.dto';
import { GetReceiptByFolioQuery } from '@/donation/application/query/get-receipt-by-folio.query';

@QueryHandler(GetReceiptByFolioQuery)
export class GetReceiptByFolioHandler extends BaseQueryHandler<
  GetReceiptByFolioQuery,
  ReceiptResponse
> {
  constructor(datasource: DataSource) {
    super(datasource);
  }

  protected async handle(
    query: GetReceiptByFolioQuery,
  ): Promise<Result<ReceiptResponse, IErrorResult>> {
    const receipt = await this.datasource
      .getRepository(ReceiptSchema)
      .createQueryBuilder('receipt')
      .where('receipt.folio = :folio', { folio: query.folio })
      .getOne();

    if (!receipt) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Receipt not found',
        entity: 'Receipt',
      });
    }

    return Result.ok(ReceiptMapper.toResponse(receipt));
  }
}
