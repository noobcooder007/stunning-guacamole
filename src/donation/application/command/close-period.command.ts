export class ClosePeriodCommand {
  constructor(
    public readonly userId: string,
    public readonly exchangeRateUsdToMxn?: number,
  ) {}
}
