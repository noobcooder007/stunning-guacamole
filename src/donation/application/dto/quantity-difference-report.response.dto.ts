export interface QuantityDifferenceRowDto {
  collectorId: string;
  collectorNumber: number;
  collectorName: string;
  assignedAmountMxn: number;
  assignedAmountUsd: number;
  assignedAmountConsolidatedMxn: number | null;
  assignedCount: number;
  collectedAmountMxn: number;
  collectedAmountUsd: number;
  collectedAmountConsolidatedMxn: number | null;
  collectedCount: number;
  differenceMxn: number;
  differenceUsd: number;
  differenceConsolidatedMxn: number | null;
}

export interface QuantityDifferenceTotalsDto {
  assignedAmountMxn: number;
  assignedAmountUsd: number;
  assignedAmountConsolidatedMxn: number | null;
  assignedCount: number;
  collectedAmountMxn: number;
  collectedAmountUsd: number;
  collectedAmountConsolidatedMxn: number | null;
  collectedCount: number;
  differenceMxn: number;
  differenceUsd: number;
  differenceConsolidatedMxn: number | null;
}

export interface QuantityDifferenceReportResponseDto {
  month: number;
  year: number;
  periodStatus: string | null;
  collectors: QuantityDifferenceRowDto[];
  totals: QuantityDifferenceTotalsDto;
}
