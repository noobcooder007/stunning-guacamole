export class CollectorDeactivatedEvent {
  constructor(
    public readonly collectorId: string,
    public readonly reason: string,
  ) {}
}
