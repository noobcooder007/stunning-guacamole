import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';

export class GetCollectorsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  firstname?: string;
  @IsOptional()
  @IsString()
  firstLastname?: string;
  @IsOptional()
  @IsString()
  secondLastname?: string;
  @IsOptional()
  @IsString()
  city?: string;
  @IsOptional()
  @IsString()
  state?: string;
  @IsOptional()
  @IsString()
  zipCode?: string;
}
