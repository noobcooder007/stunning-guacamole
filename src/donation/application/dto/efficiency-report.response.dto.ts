export interface EfficiencyReportRowDto {
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
  pendingAmountMxn: number;
  pendingAmountUsd: number;
  pendingAmountConsolidatedMxn: number | null;
  pendingCount: number;
  collectionRate: number | null;
}

export interface EfficiencyReportTotalsDto {
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

export interface EfficiencyReportResponseDto {
  month: number;
  year: number;
  initialDonation: number;
  finalDonation: number;
  frequency: number;
  collectorNum: number | null;
  collectors: EfficiencyReportRowDto[];
  totals: EfficiencyReportTotalsDto;
}
