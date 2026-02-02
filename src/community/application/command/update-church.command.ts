export abstract class UpdateChurchCommand {
  public readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class UpdateChurchAddressCommand extends UpdateChurchCommand {
  public readonly street: string;
  public readonly noExt: string;
  public readonly noInt: string;
  public readonly neighborhood: string;
  public readonly locality: string;
  public readonly city: string;
  public readonly state: string;
  public readonly zipCode: string;

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
  public readonly firstname: string;
  public readonly firstLastname: string;
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
  public readonly firstname: string;
  public readonly firstLastname: string;
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
  public readonly name: string;
  public readonly vicaria: string;
  public readonly decanato: string;
  public readonly parroquia: string;
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
  public readonly phoneNumber: string;

  constructor(id: string, phoneNumber: string) {
    super(id);
    this.phoneNumber = phoneNumber;
  }
}
