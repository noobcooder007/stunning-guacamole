import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class MarkAsPaidReceiptsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkAsPaidReceiptDto)
  receipts: MarkAsPaidReceiptDto[];
}

enum validPaymentMethods {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
}

export class MarkAsPaidReceiptDto {
  @IsNotEmpty()
  @IsString()
  receiptFolio: string;
  @IsNotEmpty()
  @IsEnum(validPaymentMethods)
  @IsString()
  paymentMethod: string;
  @IsOptional()
  @IsString()
  externalReference: string;
}
