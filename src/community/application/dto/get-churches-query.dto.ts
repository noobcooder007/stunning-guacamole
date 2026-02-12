import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class GetChurchesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  capilla: string;
  @IsOptional()
  @IsString()
  parroquia: string;
  @IsOptional()
  @IsString()
  decanato: string;
  @IsOptional()
  @IsString()
  vicaria: string;
}
