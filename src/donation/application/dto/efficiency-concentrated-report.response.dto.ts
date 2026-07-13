import { EfficiencyType } from '@/donation/domain/constants/efficiency-type.enum';

export interface EfficiencyConcentratedRowDto {
  collectorId: string;
  collectorNumber: number;
  collectorName: string;
  groupLabel: string;
  assignedAmount: number;
  assignedCount: number;
  collectedAmount: number;
  collectedCount: number;
  pendingAmount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface EfficiencyConcentratedReportResponseDto {
  startDate: string;
  endDate: string;
  initialPercentage: number;
  finalPercentage: number;
  efficiencyType: EfficiencyType;
  collectorNum: number | null;
  rows: EfficiencyConcentratedRowDto[];
}
