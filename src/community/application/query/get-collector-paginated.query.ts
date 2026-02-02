import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';

export class GetCollectorQueryParams extends PaginationDto {
  @IsOptional()
  firstname: string;
  @IsOptional()
  firstLastname: string;
  @IsOptional()
  secondLastname: string;
}
