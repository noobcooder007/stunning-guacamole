export class PaginationMetaDto {
  readonly page: number;
  readonly limit: number;
  readonly itemCount: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor(page: number, limit: number, itemCount: number) {
    this.page = page;
    this.limit = limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
