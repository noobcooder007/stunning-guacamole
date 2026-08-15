export class PrintBeneficientsByCollectorReportCommand {
  constructor(
    public readonly fromMonth: number,
    public readonly fromYear: number,
    public readonly toMonth: number,
    public readonly toYear: number,
    public readonly includeSpecial: boolean,
    public readonly collectorNumber?: number,
  ) {}
}
