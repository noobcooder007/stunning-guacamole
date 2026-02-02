import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPostalCode,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBeneficientCommand {
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
  weddingAniversary: Date;

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
  noInt: string;

  @IsString()
  @IsOptional()
  neighborhood: string;

  @IsString()
  @IsOptional()
  locality: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  @IsPostalCode('MX')
  zipCode: string;

  @IsUUID()
  @IsOptional()
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
