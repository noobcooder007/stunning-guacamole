export class PrintReceiptsByCollectorCommand {
  constructor(
    public readonly collectorId: string,
    public readonly userId: string,
    public readonly month: number,
    public readonly year: number,
  ) {}
}
