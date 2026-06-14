import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Paginated } from '@/shared/domain/dto/paginated.result.dto';
import { PaginationMetaDto } from '@/shared/domain/dto/pagination.meta.dto';
import { BaseQueryService } from '@/shared/application/query/base-query.service';
import { ReceiptResponse } from '@/donation/application/dto/receipt.response.dto';
import { GetReceiptsQueryParams } from '@/donation/application/query/get-receipts-paginated.query';
import { ReceiptMapper } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';

@Injectable()
export class ReceiptsQueryService extends BaseQueryService {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async searchReceipts(
    query: GetReceiptsQueryParams,
  ): Promise<Paginated<ReceiptResponse>> {
    const { page, limit, ...filters } = query;
    const qb = this.getQueryBuilder(ReceiptSchema, 'receipt');
    this.applyFilters(qb, 'receipt', filters);
    this.applyPagination(qb, page, limit);
    const [items, total] = await qb.getManyAndCount();

    const meta = new PaginationMetaDto(page, limit, total);
    return new Paginated(items.map(ReceiptMapper.toResponse), meta);
  }
}
