export class PrintDeliveryLettersCommand {
  constructor(
    public readonly month: number,
    public readonly year: number,
    public readonly collectorNumber?: number,
  ) {}
}
