export class GetBeneficientQueryParams {
  constructor(
    readonly firstname?: string,
    readonly firstLastname?: string,
    readonly secondLastname?: string,
    readonly city?: string,
    readonly state?: string,
    readonly zipCode?: string,
    readonly page?: number,
    readonly limit?: number,
  ) {}
}
