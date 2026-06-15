import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateBeneficientPersonalDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  firstLastname?: string;

  @IsString()
  @IsOptional()
  secondLastname?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthday?: Date;

  @IsEnum(['M', 'F'])
  @IsOptional()
  genre?: string;

  @IsEnum(['Soltero', 'Casado', 'Divorciado', 'Viudo'])
  @IsOptional()
  maritalStatus?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  weddingAnniversary?: Date | null;
}

export class UpdateBeneficientAddressDto {
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

export class UpdateBeneficientContactDto {
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string | null;
}

export class UpdateBeneficientChurchDto {
  @IsUUID()
  @IsNotEmpty()
  churchId: string;
}

export class UpdateBeneficientTaxDto {
  @IsEnum(['FISICA', 'MORAL'])
  @IsOptional()
  person?: string | null;

  @IsString()
  @IsOptional()
  registeredName?: string;

  @IsString()
  @IsOptional()
  rfc?: string;
}

export class UpdateBeneficientPrivacyDto {
  @IsBoolean()
  keepPrivate: boolean;
}
