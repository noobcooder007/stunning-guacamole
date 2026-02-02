import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaymentDataResponseDto {
  @Expose()
  commissionPercent: number;
  @Expose()
  bank: string;
  @Expose()
  reference: string;
}
