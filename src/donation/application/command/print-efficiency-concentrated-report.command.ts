import { EfficiencyType } from '@/donation/domain/constants/efficiency-type.enum';

export class PrintEfficiencyConcentratedReportCommand {
  constructor(
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly initialPercentage: number,
    public readonly finalPercentage: number,
    public readonly efficiencyType: EfficiencyType,
    public readonly collectorNum?: number,
  ) {}
}
