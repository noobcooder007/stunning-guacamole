import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';

export class GetBeneficientQueryDto extends PaginationDto {
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
}
