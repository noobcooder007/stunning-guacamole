import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PrintCollectorLetterQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  collectorNumber?: number;
}
