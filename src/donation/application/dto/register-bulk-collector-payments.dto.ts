import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CollectorPaymentMethod } from '@/donation/domain/entities/collector-payment.entity';

export class RegisterBulkCollectorPaymentsDto {
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
