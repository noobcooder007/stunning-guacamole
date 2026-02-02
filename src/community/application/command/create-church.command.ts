import { AddressDto } from '@/shared/infrastructure/dto/address.dto';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PriestDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;
  @IsString()
  @IsNotEmpty()
  firstLastname: string;
  @IsString()
  @IsOptional()
  secondLastname: string;
}

export class EcclesialIdentityDto {
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
}

export class CreateChurchCommand {
  @IsDefined()
  @ValidateNested()
  @Type(() => EcclesialIdentityDto)
  ecclesialIdentity: EcclesialIdentityDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => PriestDto)
  priest: PriestDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => PriestDto)
  auxiliarPriest: PriestDto;
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('MX')
  phoneNumber: string;
}
