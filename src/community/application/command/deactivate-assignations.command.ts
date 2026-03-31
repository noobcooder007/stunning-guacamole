export interface IDeactivateAssignation {
  assignationId: string;
  reason: string;
}

export class DeactivateAssignationsCommand {
  readonly deactivateAssignations: IDeactivateAssignation[];

  constructor(deactivateAssignations: IDeactivateAssignation[]) {
    this.deactivateAssignations = deactivateAssignations;
  }
}
