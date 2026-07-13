export interface QuantityDifferenceRowDto {
  collectorId: string;
  collectorNumber: number;
  collectorName: string;
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  difference: number;
}

export interface QuantityDifferenceTotalsDto {
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  difference: number;
}

export interface QuantityDifferenceReportResponseDto {
  month: number;
  year: number;
  periodStatus: string | null;
  collectors: QuantityDifferenceRowDto[];
  totals: QuantityDifferenceTotalsDto;
}
