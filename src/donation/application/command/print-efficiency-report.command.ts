export class PrintEfficiencyReportCommand {
  constructor(
    public readonly month: number,
    public readonly year: number,
    public readonly initialDonation: number,
    public readonly finalDonation: number,
    public readonly frequency: number,
    public readonly collectorNum?: number,
  ) {}
}
