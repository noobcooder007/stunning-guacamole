import {
  AmountBreakdownDto,
  HistoricalEfficiencyDto,
} from '@/donation/application/dto/collector-efficiency.response.dto';

export interface CollectorEfficiencyRowDto extends AmountBreakdownDto {
  collectorId: string;
  collectorNumber: number;
  collectorName: string;
}

export interface ConsolidatedPeriodEfficiencyDto {
  periodId: string;
  month: number;
  year: number;
  periodStatus: string;
  collectors: CollectorEfficiencyRowDto[];
  totals: HistoricalEfficiencyDto;
}

export interface ConsolidatedYearEfficiencyDto {
  year: number;
  collectors: CollectorEfficiencyRowDto[];
  totals: HistoricalEfficiencyDto;
}

export interface ConsolidatedHistoricalEfficiencyDto {
  collectors: CollectorEfficiencyRowDto[];
  totals: HistoricalEfficiencyDto;
}

export interface ConsolidatedCollectorEfficiencyResponseDto {
  byPeriod: ConsolidatedPeriodEfficiencyDto[];
  byYear: ConsolidatedYearEfficiencyDto[];
  historical: ConsolidatedHistoricalEfficiencyDto;
}
