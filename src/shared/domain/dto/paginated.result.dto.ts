import { PaginationMetaDto } from './pagination.meta.dto';

export class Paginated<T> {
  readonly items: T[];
  readonly meta: PaginationMetaDto;

  constructor(items: T[], meta: PaginationMetaDto) {
    this.items = items;
    this.meta = meta;
  }
}
