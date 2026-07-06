export class PeriodTotalsDto {
  month: number;
  year: number;
  totalReceipts: number;
  newPromiseAmount: number;
}

export class VariationDto {
  amount: number;
  percentage: number;
}

export class DonationGrowthReportResponseDto {
  currentPeriod: PeriodTotalsDto;
  previousPeriod: PeriodTotalsDto;
  receiptsVariation: VariationDto;
  promiseAmountVariation: VariationDto;
}
