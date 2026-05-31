import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PrintReceiptType } from '@/donation/domain/repositories/receipt.repository';

export class PrintReceiptsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year?: number;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  collectorNumber?: number;

  @IsOptional()
  @IsEnum(['RECURRING', 'SPECIAL'])
  type?: PrintReceiptType;
}
