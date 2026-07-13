import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { EfficiencyType } from '@/donation/domain/constants/efficiency-type.enum';

export class EfficiencyConcentratedReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  initialPercentage: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  finalPercentage: number;

  @IsEnum(EfficiencyType)
  efficiencyType: EfficiencyType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  collectorNum?: number;
}
