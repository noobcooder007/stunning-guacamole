import { PrintReceiptFilters } from '@/donation/domain/repositories/receipt.repository';

export class PrintReceiptsByCollectorCommand {
  constructor(
    public readonly filters: PrintReceiptFilters,
    public readonly userId: string,
  ) {}
}
