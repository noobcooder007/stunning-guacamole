import { IQuery } from '@nestjs/cqrs';

export class ValidateReceiptQuery implements IQuery {
  constructor(public readonly folio: string) {}
}
