export class GetChurchQueryParams {
  constructor(
    readonly name?: string,
    readonly capilla?: string,
    readonly parroquia?: string,
    readonly decanato?: string,
    readonly vicaria?: string,
    readonly page?: number,
    readonly limit?: number,
  ) {}
}
