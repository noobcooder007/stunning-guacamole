export class GetReceiptsQueryParams {
  constructor(
    public readonly status: string,
    public readonly type: string,
    public readonly collectorId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly periodMonth?: number,
    public readonly periodYear?: number,
    public readonly folio?: string,
    public readonly beneficientId?: string,
  ) {}
}
