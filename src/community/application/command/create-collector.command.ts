import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsNumber,
  IsArray,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCollectorCommand {
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
  nss: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s-]+$/, { message: 'Number exterior invalid' })
  noExt: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s-]+$/, { message: 'Number interior invalid' })
  noInt?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  locality?: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('MX')
  phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  commissionPercent: number;

  @IsString()
  @IsNotEmpty()
  bank: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  beneficients: string[];
}
