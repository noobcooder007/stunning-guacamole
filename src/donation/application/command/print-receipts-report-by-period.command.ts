export class PrintReceiptsReportByPeriodCommand {
  constructor(
    public readonly month: number,
    public readonly year: number,
  ) {}
}
