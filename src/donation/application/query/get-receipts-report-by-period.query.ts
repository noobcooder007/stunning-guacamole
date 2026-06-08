export class GetReceiptsReportByPeriodQuery {
  constructor(
    public readonly month: number,
    public readonly year: number,
  ) {}
}
