export class SettlementResponseDto {
  id: string;
  collectionPeriodId: string;
  collectorId: string;
  month: number;
  year: number;
  totalCollected: number;
  commissionPercent: number;
  commissionAmount: number;
  createdAt: Date;
}
