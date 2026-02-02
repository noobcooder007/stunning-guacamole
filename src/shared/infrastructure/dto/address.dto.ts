import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsPostalCode,
} from 'class-validator';
import { IsExactlyOneLocation } from '@/shared/infrastructure/validators/address.validator';

@IsExactlyOneLocation()
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.\-\/]+$/, { message: 'noExt invalid' })
  noExt: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value === null ? null : value))
  noInt?: string | null;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value === null ? null : value))
  neighborhood?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value === null ? null : value))
  locality?: string;
  @IsString()
  @IsNotEmpty()
  city: string;
  @IsString()
  @IsNotEmpty()
  state: string;
  @IsPostalCode('MX')
  @IsNotEmpty()
  zipCode: string;
}
