export class CreateCollectorCommand {
  username: string;
  password: string;
  firstname: string;
  firstLastname: string;
  secondLastname?: string;
  nss: string;
  nssHash: string;
  street: string;
  noExt: string;
  noInt?: string;
  neighborhood?: string;
  locality?: string;
  city: string;
  state: string;
  zipCode: string;
  addressHash: string;
  phoneNumber: string;
  phoneNumberHash: string;
  telephoneNumber?: string;
  telephoneNumberHash?: string;
  commissionPercent: number;
  bank: string;
  reference: string;
  notes: string;
  profilePath: string;

  constructor(
    username: string,
    password: string,
    firstname: string,
    firstLastname: string,
    nss: string,
    street: string,
    noExt: string,
    city: string,
    state: string,
    zipCode: string,
    phoneNumber: string,
    commissionPercent: number,
    bank: string,
    reference: string,
    notes: string,
    profilePath: string,
    secondLastname?: string,
    noInt?: string,
    neighborhood?: string,
    locality?: string,
    telephoneNumber?: string,
  ) {
    this.username = username;
    this.password = password;
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
    this.nss = nss;
    this.street = street;
    this.noExt = noExt;
    this.noInt = noInt;
    this.neighborhood = neighborhood;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.locality = locality;
    this.phoneNumber = phoneNumber;
    this.telephoneNumber = telephoneNumber;
    this.commissionPercent = commissionPercent;
    this.bank = bank;
    this.reference = reference;
    this.notes = notes;
    this.profilePath = profilePath;
  }
}
