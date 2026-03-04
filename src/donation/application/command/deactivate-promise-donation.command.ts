export class DeactivatePromiseDonationCommand {
  constructor(
    public readonly id: string,
    public readonly reason: string,
  ) {}
}
