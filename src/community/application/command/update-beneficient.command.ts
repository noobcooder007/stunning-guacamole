export abstract class UpdateBeneficientCommand {
  public readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class UpdateBeneficientPersonalCommand extends UpdateBeneficientCommand {
  public readonly title?: string;
  public readonly firstname?: string;
  public readonly firstLastname?: string;
  public readonly secondLastname?: string;
  public readonly birthday?: Date;
  public readonly genre?: string;
  public readonly maritalStatus?: string;
  public readonly weddingAnniversary?: Date | null;

  constructor(
    id: string,
    title?: string,
    firstname?: string,
    firstLastname?: string,
    secondLastname?: string,
    birthday?: Date,
    genre?: string,
    maritalStatus?: string,
    weddingAnniversary?: Date | null,
  ) {
    super(id);
    this.title = title;
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
    this.birthday = birthday;
    this.genre = genre;
    this.maritalStatus = maritalStatus;
    this.weddingAnniversary = weddingAnniversary;
  }
}

export class UpdateBeneficientAddressCommand extends UpdateBeneficientCommand {
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

export class UpdateBeneficientContactCommand extends UpdateBeneficientCommand {
  public readonly email?: string | null;
  public emailHash?: string | null;
  public readonly phoneNumber?: string | null;
  public phoneNumberHash?: string | null;

  constructor(id: string, email?: string | null, phoneNumber?: string | null) {
    super(id);
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}

export class UpdateBeneficientChurchCommand extends UpdateBeneficientCommand {
  public readonly churchId: string;

  constructor(id: string, churchId: string) {
    super(id);
    this.churchId = churchId;
  }
}

export class UpdateBeneficientTaxCommand extends UpdateBeneficientCommand {
  public readonly person?: string | null;
  public readonly registeredName?: string;
  public readonly rfc?: string;
  public rfcHash?: string;

  constructor(
    id: string,
    person?: string | null,
    registeredName?: string,
    rfc?: string,
  ) {
    super(id);
    this.person = person;
    this.registeredName = registeredName;
    this.rfc = rfc;
  }
}

export class UpdateBeneficientPrivacyCommand extends UpdateBeneficientCommand {
  public readonly keepPrivate: boolean;

  constructor(id: string, keepPrivate: boolean) {
    super(id);
    this.keepPrivate = keepPrivate;
  }
}
