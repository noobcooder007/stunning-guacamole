export class GetUnassignedBeneficientsQuery {
  constructor(
    readonly firstname?: string,
    readonly firstLastname?: string,
    readonly secondLastname?: string,
    readonly page?: number,
    readonly limit?: number,
  ) {}
}
