// import { ValueObject } from '@/shared/domain/vo/value-objet';
// import { ReceiptStatus } from '@/shared/domain/value-objects/receipt-status.vo';
// import { PromiseDonationId } from '@/donation/domain/aggregates/promise-donation.aggregate';
// import { UserId } from '@/auth/domain/aggregates/user.aggregate';

// export class ReceiptId extends ValueObject<string> {}

// export interface ReceiptProps {
//   id: ReceiptId;
//   promiseId: PromiseDonationId; // El origen
//   // Snapshot: Copiamos estos datos de la Promesa/Comunidad
//   // para que el recibo impreso sea inmutable aunque la promesa cambie luego.
//   donorName: string;
//   colectorName: string;
//   amount: number;
//   // Control de Impresión (Tu requerimiento clave)
//   // printStatus: 'PENDING' | 'PRINTED' | 'VOID';
//   printStatus: ReceiptStatus;
//   printCount: number;
//   firstPrintedAt?: Date;
//   printedBy?: UserId;
//   // Seguridad
//   verificationHash: string; // Para el QR del impreso
// }

// export class Receipt {}
