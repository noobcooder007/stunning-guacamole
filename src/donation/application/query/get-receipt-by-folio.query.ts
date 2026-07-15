export class GetReceiptByFolioQuery {
  constructor(
    public readonly folio: string,
    public readonly scopedBeneficientId?: string,
    public readonly scopedCollectorId?: string,
  ) {}
}
