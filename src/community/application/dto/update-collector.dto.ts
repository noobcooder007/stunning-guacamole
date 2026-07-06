import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateCollectorPersonalDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  firstLastname?: string;

  @IsString()
  @IsOptional()
  secondLastname?: string | null;
}

export class UpdateCollectorAddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  noExt?: string;

  @IsString()
  @IsOptional()
  noInt?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  locality?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;
}

export class UpdateCollectorContactDto {
  @IsPhoneNumber('MX')
  @IsOptional()
  phoneNumber?: string;

  @IsPhoneNumber('MX')
  @IsOptional()
  telephoneNumber?: string | null;
}

export class UpdateCollectorPaymentDto {
  @IsNumber()
  @IsOptional()
  commissionPercent?: number;

  @IsNumber()
  @IsOptional()
  nomina?: number;

  @IsNumber()
  @IsOptional()
  transportAllowance?: number;

  @IsString()
  @IsOptional()
  bank?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}

export class UpdateCollectorNotesDto {
  @IsString()
  @IsOptional()
  notes: string;
}
