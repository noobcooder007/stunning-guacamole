export class DeactivateBeneficientCommand {
  constructor(
    public readonly beneficientId: string,
    public readonly reason: string,
  ) {}
}
