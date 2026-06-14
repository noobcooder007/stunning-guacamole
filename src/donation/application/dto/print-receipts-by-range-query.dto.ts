import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PrintReceiptsByRangeQueryDto {
  @IsOptional()
  @IsUUID()
  collectorId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  collectorNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstLastname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondLastname?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  fromSequence: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  toSequence: number;
}
