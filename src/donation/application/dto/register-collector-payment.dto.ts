import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

export class RegisterCollectorPaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(CollectorPaymentMethod)
  @IsNotEmpty()
  paymentMethod: CollectorPaymentMethod;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsNotEmpty()
  paidAt: string;
}
