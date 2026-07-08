export class ValidateReceiptResponseDto {
  valid: boolean;
  folio?: string;
  status?: string;
  type?: string;
  amount?: number;
  currency?: string;
}
