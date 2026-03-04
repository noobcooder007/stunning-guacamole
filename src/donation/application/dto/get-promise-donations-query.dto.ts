import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { Transform } from 'class-transformer';

export class GetPromiseDonationsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @IsOptional()
  @IsString()
  recurrence?: string;

  @IsOptional()
  @Transform(({ obj, key }) => {
    const value = obj[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
