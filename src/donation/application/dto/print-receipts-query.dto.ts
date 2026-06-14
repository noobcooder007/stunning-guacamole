import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PrintReceiptType } from '@/donation/domain/repositories/receipt.repository';

export class PrintReceiptsQueryDto {
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

  @IsOptional()
  @IsEnum(['RECURRING', 'SPECIAL'])
  type?: PrintReceiptType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  fromSequence?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  toSequence?: number;
}
