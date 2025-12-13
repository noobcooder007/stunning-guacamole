import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateChurchDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  vicaria;
  @IsString()
  @IsNotEmpty()
  decanato: string;
  @IsString()
  @IsNotEmpty()
  parroquia: string;
  @IsString()
  @IsNotEmpty()
  capilla: string;
  @IsString()
  @IsNotEmpty()
  street: string;
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
  @IsNotEmpty()
  principalName: string;
  @IsString()
  @IsNotEmpty()
  principalFirstLastname: string;
  @IsString()
  @IsOptional()
  principalSecondLastname: string;
  @IsString()
  @IsNotEmpty()
  auxiliarName?: string;
  @IsString()
  @IsNotEmpty()
  auxiliarFirstLastname?: string;
  @IsString()
  @IsOptional()
  auxiliarSecondLastname?: string;
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('MX')
  phoneNumber: string;
}
