import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class GetUnassignedBeneficientsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  firstLastname?: string;

  @IsOptional()
  @IsString()
  secondLastname?: string;
}
