import { AddressDto } from '@/shared/infrastructure/dto/address.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  IsEmail,
  IsUUID,
  IsDefined,
  ValidateNested,
  IsPhoneNumber,
  IsBoolean,
} from 'class-validator';

export class CreateBeneficientDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  firstLastname: string;

  @IsString()
  @IsOptional()
  secondLastname: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  birthday: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  weddingAnniversary: Date;

  @IsString()
  @IsEnum(['M', 'F'])
  @IsNotEmpty()
  genre: string;

  @IsString()
  @IsEnum(['Soltero', 'Casado', 'Divorciado', 'Viudo'])
  @IsNotEmpty()
  maritalStatus: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;

  @IsBoolean()
  keepPrivate: boolean;

  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsUUID()
  @IsNotEmpty()
  churchId: string;

  @IsString()
  @IsOptional()
  @IsEnum(['FISICA', 'MORAL'])
  person: string;

  @IsString()
  @IsOptional()
  registeredName: string;

  @IsString()
  @IsOptional()
  rfc: string;
}
