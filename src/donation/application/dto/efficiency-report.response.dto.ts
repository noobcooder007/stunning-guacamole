export interface EfficiencyReportRowDto {
  collectorId: string;
  collectorNumber: number;
  collectorName: string;
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  pendingAmount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface EfficiencyReportTotalsDto {
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  pendingAmount: number;
  pendingCount: number;
  collectionRate: number;
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
