import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaymentDataResponseDto {
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  commissionPercent: number;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  nomina: number;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  transportAllowance: number;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  bank: string;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  reference: string;
}
