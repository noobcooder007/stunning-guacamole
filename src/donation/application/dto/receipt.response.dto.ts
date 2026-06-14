export class ReceiptResponse {
  id: string;
  status: string;
  folio: string;
  type: string;
  origin: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  externalReference: string | null;
  promiseDonationId: string | null;
  periodMonth: number | null;
  periodYear: number | null;
  beneficientId: string | null;
  collectorId: string | null;
  collectionPeriodId: string | null;
  printCount: number;
  lastPrintedAt: Date | null;
  voidReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
