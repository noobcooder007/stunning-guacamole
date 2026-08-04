import { EfficiencyType } from '@/donation/domain/constants/efficiency-type.enum';
import { AmountBreakdownDto } from '@/donation/application/dto/collector-efficiency.response.dto';

export interface EfficiencyConcentratedRowDto extends AmountBreakdownDto {
  collectorId: string;
  collectorNumber: number;
  collectorName: string;
  groupLabel: string;
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
