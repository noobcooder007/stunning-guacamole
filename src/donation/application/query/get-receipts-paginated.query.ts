export class GetReceiptsQueryParams {
  constructor(
    public readonly status: string,
    public readonly type: string,
    public readonly collectorId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
