export class GetBeneficientQueryParams {
  constructor(
    readonly page?: number,
    readonly limit?: number,
  ) {}
}

export class SearchBeneficientsQuery {
  constructor(
    readonly firstname?: string,
    readonly firstLastname?: string,
    readonly secondLastname?: string,
    readonly beneficientNumber?: number,
  ) {}
}
