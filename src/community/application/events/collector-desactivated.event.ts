export class CollectorDesactivatedEvent {
  constructor(
    public readonly collectorId: string,
    public readonly reason: string,
  ) {}
}
