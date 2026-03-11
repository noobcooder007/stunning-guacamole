import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetActiveAssignationsQueryDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID()
  collectorId: string;
}
