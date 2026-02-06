export class DeactivateCollectorCommand {
  public readonly collectorId: string;

  constructor(collectorId: string) {
    this.collectorId = collectorId;
  }
}
