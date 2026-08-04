export class PeriodTotalsDto {
  month: number;
  year: number;
  totalReceiptsMxn: number;
  totalReceiptsUsd: number;
  totalReceiptsConsolidatedMxn: number | null;
  newPromiseAmountMxn: number;
  newPromiseAmountUsd: number;
}

export class VariationDto {
  amount: number;
  percentage: number;
}

export class DonationGrowthReportResponseDto {
  currentPeriod: PeriodTotalsDto;
  previousPeriod: PeriodTotalsDto;
  receiptsVariationMxn: VariationDto;
  receiptsVariationUsd: VariationDto;
  promiseAmountVariationMxn: VariationDto;
  promiseAmountVariationUsd: VariationDto;
}
