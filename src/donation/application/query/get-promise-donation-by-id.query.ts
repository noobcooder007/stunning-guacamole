export class GetPromiseDonationByIdQuery {
  constructor(
    public readonly id: string,
    public readonly scopedBeneficientId?: string,
  ) {}
}
