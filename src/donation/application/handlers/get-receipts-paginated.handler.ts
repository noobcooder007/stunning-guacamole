import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { GetReceiptsQueryParams } from '@/donation/application/query/get-receipts-paginated.query';
import { ReceiptsQueryService } from '@/donation/infrastructure/service/receipt.query.service';
import { ReceiptResponse } from '@/donation/application/dto/receipt.response.dto';

@QueryHandler(GetReceiptsQueryParams)
export class GetReceiptsPaginatedHandler extends BaseQueryHandler<
  GetReceiptsQueryParams,
  Paginated<ReceiptResponse>
> {
  constructor(
    datasource: DataSource,
    private readonly receiptsQueryService: ReceiptsQueryService,
  ) {
    super(datasource);
  }

  protected async handle(
    query: GetReceiptsQueryParams,
  ): Promise<Result<Paginated<ReceiptResponse>, IErrorResult>> {
    const paginatedReceipts =
      await this.receiptsQueryService.searchReceipts(query);
    return Result.ok<Paginated<ReceiptResponse>>(paginatedReceipts);
  }
}
