export class GetActiveAssignationsQuery {
  constructor(
    readonly collectorId: string,
    readonly page?: number,
    readonly limit?: number,
  ) {}
}
