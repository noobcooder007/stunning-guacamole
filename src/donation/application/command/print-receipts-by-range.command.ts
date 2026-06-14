import { PrintReceiptRangeFilters } from '@/donation/domain/repositories/receipt.repository';

export class PrintReceiptsByRangeCommand {
  constructor(
    public readonly filters: PrintReceiptRangeFilters,
    public readonly userId: string,
  ) {}
}
