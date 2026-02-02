import { IsOptional, IsString, IsUUID } from 'class-validator';

export abstract class UpdateChurchCommand {
  @IsUUID()
  public readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class UpdateChurchAddressCommand extends UpdateChurchCommand {
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

  @IsString()
  @IsOptional()
  id: string;
  constructor(
    id: string,
    street: string,
    noExt: string,
    noInt: string,
    neighborhood: string,
    locality: string,
    city: string,
    state: string,
    zipCode: string,
  ) {
    super(id);
    this.street = street;
    this.noExt = noExt;
    this.noInt = noInt;
    this.neighborhood = neighborhood;
    this.locality = locality;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
  }
}

export class UpdateChurchPriestCommand extends UpdateChurchCommand {
  @IsString()
  @IsOptional()
  public readonly firstname: string;

  @IsString()
  @IsOptional()
  public readonly firstLastname: string;

  @IsString()
  @IsOptional()
  public readonly secondLastname: string;

  constructor(
    id: string,
    firstname: string,
    firstLastname: string,
    secondLastname: string,
  ) {
    super(id);
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
  }
}

export class UpdateChurchAuxiliarPriestCommand extends UpdateChurchCommand {
  @IsString()
  @IsOptional()
  public readonly firstname: string;

  @IsString()
  @IsOptional()
  public readonly firstLastname: string;

  @IsString()
  @IsOptional()
  public readonly secondLastname: string;

  constructor(
    id: string,
    firstname: string,
    firstLastname: string,
    secondLastname: string,
  ) {
    super(id);
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
  }
}

export class UpdateChurchEcclesialIdentityCommand extends UpdateChurchCommand {
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

  constructor(
    id: string,
    name: string,
    vicaria: string,
    decanato: string,
    parroquia: string,
    capilla: string,
  ) {
    super(id);
    this.name = name;
    this.vicaria = vicaria;
    this.decanato = decanato;
    this.parroquia = parroquia;
    this.capilla = capilla;
  }
}

export class UpdateChurchPhoneNumberCommand extends UpdateChurchCommand {
  @IsString()
  @IsOptional()
  public readonly phoneNumber: string;

  constructor(id: string, phoneNumber: string) {
    super(id);
    this.phoneNumber = phoneNumber;
  }
}
