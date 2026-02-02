import { IsOptional, IsString } from 'class-validator';

export class UpdateChurchAddressDto {
  @IsString()
  @IsOptional()
  public readonly street: string;

  @IsString()
  @IsOptional()
  public readonly noExt: string;

  @IsString()
  @IsOptional()
  public readonly noInt: string;

  @IsString()
  @IsOptional()
  public readonly neighborhood: string;

  @IsString()
  @IsOptional()
  public readonly locality: string;

  @IsString()
  @IsOptional()
  public readonly city: string;

  @IsString()
  @IsOptional()
  public readonly state: string;

  @IsString()
  @IsOptional()
  public readonly zipCode: string;
}

export class UpdateChurchPriestDto {
  @IsString()
  @IsOptional()
  public readonly firstname: string;

  @IsString()
  @IsOptional()
  public readonly firstLastname: string;

  @IsString()
  @IsOptional()
  public readonly secondLastname: string;
}

export class UpdateChurchAuxiliarPriestDto {
  @IsString()
  @IsOptional()
  public readonly firstname: string;

  @IsString()
  @IsOptional()
  public readonly firstLastname: string;

  @IsString()
  @IsOptional()
  public readonly secondLastname: string;
}

export class UpdateChurchEcclesialIdentityDto {
  @IsString()
  @IsOptional()
  public readonly name: string;

  @IsString()
  @IsOptional()
  public readonly vicaria: string;

  @IsString()
  @IsOptional()
  public readonly decanato: string;

  @IsString()
  @IsOptional()
  public readonly parroquia: string;

  @IsString()
  @IsOptional()
  public readonly capilla: string;
}

export class UpdateChurchPhoneNumberDto {
  @IsString()
  @IsOptional()
  public readonly phoneNumber: string;
}
