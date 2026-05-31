export interface PeriodEfficiencyDto {
  periodId: string;
  month: number;
  year: number;
  periodStatus: string;
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  pendingAmount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface YearEfficiencyDto {
  year: number;
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  pendingAmount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface HistoricalEfficiencyDto {
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  pendingAmount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface CollectorEfficiencyResponseDto {
  collectorId: string;
  byPeriod: PeriodEfficiencyDto[];
  byYear: YearEfficiencyDto[];
  historical: HistoricalEfficiencyDto;
}
