import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class GetActiveAssignationsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  collectorId?: string;
}
