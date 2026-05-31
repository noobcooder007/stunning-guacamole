export class PeriodResponseDto {
  id: string;
  month: number;
  year: number;
  status: string;
  closedAt?: Date;
  closedBy?: string;
  createdAt: Date;
  createdBy: string;
  totalCollected?: number;
  totalCommissions?: number;
  totalNet?: number;
  pendingReceiptsCount?: number;
}
