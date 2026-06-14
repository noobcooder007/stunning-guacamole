import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PrintDeliveryLetterQueryDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  collectorNumber?: number;
}
