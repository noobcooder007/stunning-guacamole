import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class QuantityDifferenceReportDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;
}
