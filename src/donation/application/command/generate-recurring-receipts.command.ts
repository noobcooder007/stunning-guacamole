export type GenerateRecurringReceiptsTargetPeriod = 'OPEN' | 'SCHEDULED';

export class GenerateRecurringReceiptsCommand {
  constructor(
    public readonly userId: string,
    public readonly targetPeriod: GenerateRecurringReceiptsTargetPeriod = 'OPEN',
  ) {}
}
