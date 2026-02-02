import { InvoiceStatus } from '../value-objects/invoice-status.vo';

export class Invoice {
  id: string;
  frecuency: string; // e.g., 'monthly', 'quarterly', 'yearly', 'special'
  invoiceNumber: string;
  invoiceDate: Date;
  amount: number;
  status: InvoiceStatus; // e.g., 'paid', 'pending', 'cancelled'
  beneficientId: string;
  collectorId: string;
}
