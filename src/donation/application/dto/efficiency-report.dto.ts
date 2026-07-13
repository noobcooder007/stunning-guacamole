import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class EfficiencyReportDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  initialDonation: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  finalDonation: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  frequency: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  collectorNum?: number;
}
