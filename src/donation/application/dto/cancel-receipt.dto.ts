import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CancelReceiptDto {
  @IsNotEmpty()
  @IsUUID()
  receiptId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
