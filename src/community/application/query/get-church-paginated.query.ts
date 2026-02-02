import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { IsOptional } from 'class-validator';

export class GetChurchQueryParams extends PaginationDto {
  @IsOptional()
  name: string;
  @IsOptional()
  capilla: string;
}
