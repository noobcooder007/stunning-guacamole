import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class ClosePeriodDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  exchangeRateUsdToMxn?: number;
}
