export class CreateBeneficientCommand {
  title: string;
  firstname: string;
  firstLastname: string;
  secondLastname: string;
  birthday: Date;
  weddingAniversary: Date;
  genre: string;
  maritalStatus: string;
  email?: string;
  emailHash?: string;
  street: string;
  noExt: string;
  noInt: string;
  neighborhood: string;
  locality: string;
  city: string;
  state: string;
  zipCode: string;
  addressHash: string;
  churchId: string;
  person?: string;
  registeredName?: string;
  rfc?: string;
  rfcHash?: string;

  constructor(
    title: string,
    firstname: string,
    firstLastname: string,
    secondLastname: string,
    birthday: Date,
    weddingAniversary: Date,
    genre: string,
    maritalStatus: string,
    street: string,
    noExt: string,
    noInt: string,
    neighborhood: string,
    locality: string,
    city: string,
    state: string,
    zipCode: string,
    churchId: string,
    person?: string,
    registeredName?: string,
    rfc?: string,
    email?: string,
  ) {
    this.title = title;
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
    this.birthday = birthday;
    this.weddingAniversary = weddingAniversary;
    this.genre = genre;
    this.maritalStatus = maritalStatus;
    this.email = email;
    this.street = street;
    this.noExt = noExt;
    this.noInt = noInt;
    this.neighborhood = neighborhood;
    this.locality = locality;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.churchId = churchId;
    this.person = person;
    this.registeredName = registeredName;
    this.rfc = rfc;
  }
}
