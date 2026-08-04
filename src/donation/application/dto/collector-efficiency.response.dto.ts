export interface AmountBreakdownDto {
  assignedAmountMxn: number;
  assignedAmountUsd: number;
  assignedAmountConsolidatedMxn: number | null;
  assignedCount: number;
  collectedAmountMxn: number;
  collectedAmountUsd: number;
  collectedAmountConsolidatedMxn: number | null;
  collectedCount: number;
  pendingAmountMxn: number;
  pendingAmountUsd: number;
  pendingAmountConsolidatedMxn: number | null;
  pendingCount: number;
  collectionRate: number | null;
}

export interface PeriodEfficiencyDto extends AmountBreakdownDto {
  periodId: string;
  month: number;
  year: number;
  periodStatus: string;
}

export interface YearEfficiencyDto extends AmountBreakdownDto {
  year: number;
}

export type HistoricalEfficiencyDto = AmountBreakdownDto;

export interface CollectorEfficiencyResponseDto {
  collectorId: string;
  byPeriod: PeriodEfficiencyDto[];
  byYear: YearEfficiencyDto[];
  historical: HistoricalEfficiencyDto;
}
