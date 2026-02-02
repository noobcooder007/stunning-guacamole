export class DesactivateAssignationsEvent {
  constructor(
    public readonly collectorId: string,
    public readonly assignationsIds: string[],
    public readonly reason: string,
  ) {}
}
