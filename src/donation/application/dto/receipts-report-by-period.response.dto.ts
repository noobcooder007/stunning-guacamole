export class CollectorReceiptsReportItemDto {
  collectorNumber: number;
  collectorName: string;
  accumulatedAmountMxn: number;
  accumulatedAmountUsd: number;
  // Total en MXN considerando el tipo de cambio del período; null si el
  // período aún no tiene tasa capturada (abierto) y hay montos en USD.
  accumulatedAmountConsolidatedMxn: number | null;
}

export class ReceiptsReportByPeriodResponseDto {
  month: number;
  year: number;
  collectors: CollectorReceiptsReportItemDto[];
  totalAccumulatedAmountMxn: number;
  totalAccumulatedAmountUsd: number;
  totalAccumulatedAmountConsolidatedMxn: number | null;
}
