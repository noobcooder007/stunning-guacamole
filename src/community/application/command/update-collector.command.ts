export abstract class UpdateCollectorCommand {
  public readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class UpdateCollectorPersonalCommand extends UpdateCollectorCommand {
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

export class UpdateCollectorAddressCommand extends UpdateCollectorCommand {
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

export class UpdateCollectorContactCommand extends UpdateCollectorCommand {
  public readonly phoneNumber?: string;
  public phoneNumberHash?: string;
  public readonly telephoneNumber?: string | null;
  public telephoneNumberHash?: string | null;

  constructor(
    id: string,
    phoneNumber?: string,
    telephoneNumber?: string | null,
  ) {
    super(id);
    this.phoneNumber = phoneNumber;
    this.telephoneNumber = telephoneNumber;
  }
}

export class UpdateCollectorPaymentCommand extends UpdateCollectorCommand {
  public readonly commissionPercent?: number;
  public readonly nomina?: number;
  public readonly transportAllowance?: number;
  public readonly bank?: string;
  public readonly reference?: string;

  constructor(
    id: string,
    commissionPercent?: number,
    nomina?: number,
    transportAllowance?: number,
    bank?: string,
    reference?: string,
  ) {
    super(id);
    this.commissionPercent = commissionPercent;
    this.nomina = nomina;
    this.transportAllowance = transportAllowance;
    this.bank = bank;
    this.reference = reference;
  }
}

export class UpdateCollectorNotesCommand extends UpdateCollectorCommand {
  public readonly notes: string;

  constructor(id: string, notes: string) {
    super(id);
    this.notes = notes;
  }
}
