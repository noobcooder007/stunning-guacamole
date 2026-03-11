export class GetPromiseDonationQueryParams {
  constructor(
    public readonly currency?: string,
    public readonly method?: string,
    public readonly recurring?: boolean,
    public readonly recurrence?: number,
    public readonly isActive?: boolean,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
