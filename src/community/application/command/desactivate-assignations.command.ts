export interface IDesactivateAssignation {
  assignationId: string;
  reason: string;
}

export class DesactivateAssignationsCommand {
  readonly desactivateAssignations: IDesactivateAssignation[];

  constructor(desactivateAssignations: IDesactivateAssignation[]) {
    this.desactivateAssignations = desactivateAssignations;
  }
}
