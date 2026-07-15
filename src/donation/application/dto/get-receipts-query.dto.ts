import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GetReceiptsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  collectorId: string;
  @IsOptional()
  @IsUUID()
  beneficientId: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  folio: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(['PENDING', 'PAID', 'CANCELLED'])
  status: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(['RECURRING', 'SPECIAL'])
  type: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;
}
