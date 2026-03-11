import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';

export class GetPromiseDonationsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @Transform(({ obj, key }) => {
    const value = obj[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  recurring?: boolean;

  @IsOptional()
  @IsNumber()
  recurrence?: number;

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
