export class GetDonationGrowthReportQuery {
  constructor(
    public readonly month: number,
    public readonly year: number,
  ) {}
}
