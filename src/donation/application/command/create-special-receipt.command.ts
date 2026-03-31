export class CreateSpecialReceiptCommand {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly beneficientId: string,
    public readonly collectorId: string,
    public readonly userId: string,
  ) {}
}
