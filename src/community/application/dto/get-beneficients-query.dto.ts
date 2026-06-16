import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';

export class GetBeneficientsQueryDto extends PaginationDto {}

export class SearchBeneficientsQueryDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  firstLastname?: string;

  @IsString()
  @IsOptional()
  secondLastname?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  beneficientNumber?: number;
}
