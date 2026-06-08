export class CollectorReceiptsReportItemDto {
  collectorNumber: number;
  collectorName: string;
  accumulatedAmount: number;
}

export class ReceiptsReportByPeriodResponseDto {
  month: number;
  year: number;
  collectors: CollectorReceiptsReportItemDto[];
  totalAccumulatedAmount: number;
}
