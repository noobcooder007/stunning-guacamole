export class CancelReceiptCommand {
  constructor(
    public readonly folio: string,
    public readonly reason: string,
    public readonly userId: string,
  ) {}
}
