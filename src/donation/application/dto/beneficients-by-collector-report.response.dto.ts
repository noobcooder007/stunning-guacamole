export class ReceiptLineReportDto {
  folio: string;
  type: 'RECURRING' | 'SPECIAL';
  amount: number;
  currency: string;
  paidAt: Date | null;
  // true/false cuando se puede comparar contra el CollectionPeriod en el que
  // se pagó; null cuando el recibo quedó PAID sin un periodo de cobranza
  // vinculado (ej. no había ningún periodo OPEN al momento del pago) y por
  // lo tanto no se puede determinar si se pagó a tiempo o retrasado.
  isDelayed: boolean | null;
  paidPeriodMonth: number | null;
  paidPeriodYear: number | null;
}

export class PeriodDonationReportDto {
  periodMonth: number;
  periodYear: number;
  receipts: ReceiptLineReportDto[];
}

export class BeneficientReportItemDto {
  beneficientNumber: number;
  beneficientName: string;
  periods: PeriodDonationReportDto[];
  totalDonatedMxn: number;
  totalDonatedUsd: number;
}

export class CollectorBeneficientsReportItemDto {
  collectorNumber: number;
  collectorName: string;
  beneficients: BeneficientReportItemDto[];
}

export class BeneficientsByCollectorReportResponseDto {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
  includeSpecial: boolean;
  collectors: CollectorBeneficientsReportItemDto[];
}
