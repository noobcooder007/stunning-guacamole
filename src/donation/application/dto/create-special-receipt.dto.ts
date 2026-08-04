import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { Currency } from '@/shared/domain/enums/currency.enum';

export class CreateSpecialReceiptDto {
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: string;

  @IsNotEmpty()
  @IsUUID()
  beneficientId: string;

  @IsNotEmpty()
  @IsUUID()
  collectorId: string;
}
