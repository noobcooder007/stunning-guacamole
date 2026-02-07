import { IDeactivateAssignation } from '@/community/domain/services/assignament.service';

export class ReassignBeneficientsCommand {
  public readonly collectorId: string;
  public readonly assignationsIds: IDeactivateAssignation[];

  constructor(collectorId: string, assignationsIds: IDeactivateAssignation[]) {
    this.collectorId = collectorId;
    this.assignationsIds = assignationsIds;
  }
}
