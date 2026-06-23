import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

enum actualCurrencies {
  USD = 'USD',
  MXN = 'MXN',
}

export class CreateSpecialReceiptDto {
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(actualCurrencies)
  currency: string;

  @IsNotEmpty()
  @IsUUID()
  beneficientId: string;

  @IsNotEmpty()
  @IsUUID()
  collectorId: string;
}
