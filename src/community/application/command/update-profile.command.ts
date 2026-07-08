export abstract class UpdateProfileCommand {
  public readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class UpdateProfilePersonalCommand extends UpdateProfileCommand {
  public readonly firstname?: string;
  public readonly firstLastname?: string;
  public readonly secondLastname?: string | null;

  constructor(
    id: string,
    firstname?: string,
    firstLastname?: string,
    secondLastname?: string | null,
  ) {
    super(id);
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
  }
}

export class UpdateProfileAddressCommand extends UpdateProfileCommand {
  public readonly street?: string;
  public readonly noExt?: string;
  public readonly noInt?: string;
  public readonly neighborhood?: string;
  public readonly locality?: string;
  public readonly city?: string;
  public readonly state?: string;
  public readonly zipCode?: string;
  public addressHash: string;

  constructor(
    id: string,
    street?: string,
    noExt?: string,
    noInt?: string,
    neighborhood?: string,
    locality?: string,
    city?: string,
    state?: string,
    zipCode?: string,
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

export class UpdateProfileContactCommand extends UpdateProfileCommand {
  public readonly phoneNumber: string | null;
  public phoneNumberHash: string | null;

  constructor(id: string, phoneNumber: string | null) {
    super(id);
    this.phoneNumber = phoneNumber;
  }
}
