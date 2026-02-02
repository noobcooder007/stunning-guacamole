export class AssignBeneficientsCommand {
  public readonly collectorId: string;
  public readonly beneficientsIds: string[];

  constructor(collectorId: string, beneficientsIds: string[]) {
    this.collectorId = collectorId;
    this.beneficientsIds = beneficientsIds;
  }
}
