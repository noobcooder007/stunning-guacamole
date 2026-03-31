export class CancelReceiptCommand {
  constructor(
    public readonly receiptId: string,
    public readonly reason: string,
    public readonly userId: string,
  ) {}
}
