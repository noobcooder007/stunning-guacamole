import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';

export class GetBeneficientsQueryDto extends PaginationDto {
  @IsOptional()
  firstname: string;
  @IsOptional()
  firstLastname: string;
  @IsOptional()
  secondLastname: string;
  @IsOptional()
  city: string;
  @IsOptional()
  state: string;
  @IsOptional()
  zipCode: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  beneficientNumber: number;
}
