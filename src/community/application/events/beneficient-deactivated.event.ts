export class BeneficientDeactivatedEvent {
  constructor(
    public readonly beneficientId: string,
    public readonly reason: string,
  ) {}
}
