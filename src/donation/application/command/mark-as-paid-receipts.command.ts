export class MarkAsPaidReceiptsCommand {
  constructor(
    public readonly receipts: {
      receiptFolio: string;
      paymentMethod: string;
      externalReference?: string;
    }[],
  ) {}
}
