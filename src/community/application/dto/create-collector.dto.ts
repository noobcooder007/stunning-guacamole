import { AddressDto } from '@/shared/infrastructure/dto/address.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsNumber,
  IsDefined,
  ValidateNested,
  Matches,
} from 'class-validator';

export class CreateCollectorDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  firstLastname: string;

  @IsString()
  @IsOptional()
  secondLastname?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
  @Matches(/^[0-9]+$/, {
    message: 'NSS must contain only numbers',
  })
  nss: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('MX')
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('MX')
  telephoneNumber?: string;

  @IsNumber()
  @IsNotEmpty()
  commissionPercent: number;

  @IsNumber()
  @IsNotEmpty()
  nomina: number;

  @IsNumber()
  @IsNotEmpty()
  transportAllowance: number;

  @IsString()
  @IsNotEmpty()
  bank: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsOptional()
  notes: string;
}
