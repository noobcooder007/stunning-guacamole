import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetReceiptsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  collectorId: string;
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
}
