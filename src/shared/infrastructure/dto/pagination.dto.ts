import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  offset: number = 1;
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Type(() => Number)
  limit: number = 10;
}
