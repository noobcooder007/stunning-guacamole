import { CollectorSettlementPaymentStatus } from '@/donation/domain/entities/collector-settlement.entity';

export class SettlementResponseDto {
  id: string;
  collectionPeriodId: string;
  collectorId: string;
  month: number;
  year: number;
  totalCollected: number;
  commissionPercent: number;
  commissionAmount: number;
  nomina: number;
  transportAllowance: number;
  netCommission: number;
  paymentStatus: CollectorSettlementPaymentStatus;
  totalPaid: number;
  remainingBalance: number;
  createdAt: Date;
}
