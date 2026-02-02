import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { IsOptional } from 'class-validator';

export class GetBeneficientQueryParams extends PaginationDto {
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
