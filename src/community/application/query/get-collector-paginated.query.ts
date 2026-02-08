export class GetCollectorQueryParams {
  readonly firstname: string;
  readonly firstLastname: string;
  readonly secondLastname: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly offset: number;
  readonly limit: number;

  constructor(
    firstname: string,
    firstLastname: string,
    secondLastname: string,
    city: string,
    state: string,
    zipCode: string,
    offset: number,
    limit: number,
  ) {
    this.firstname = firstname;
    this.firstLastname = firstLastname;
    this.secondLastname = secondLastname;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.offset = offset;
    this.limit = limit;
  }
}
