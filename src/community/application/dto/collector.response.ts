import { Exclude, Expose, Type } from 'class-transformer';
import { MaskHelper } from '@/shared/infrastructure/utils/mask-helper.util';
import { AddressResponseDto } from '@/community/application/dto/address.response';
import { PaymentDataResponseDto } from '@/community/application/dto/payment-data.response';

@Exclude()
export class CollectorResponse {
  @Expose()
  id: string;
  userId: string;
  @Expose()
  firstname: string;
  @Expose()
  firstLastname: string;
  @Expose()
  secondLastname: string;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  nss: string;
  @Expose()
  get maskedNSS(): string {
    return MaskHelper.mask(this.nss, 4);
  }
  @Expose()
  @Type(() => AddressResponseDto)
  address: AddressResponseDto;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  phoneNumber: string;
  @Expose()
  get maskedPhoneNumber(): string {
    return MaskHelper.mask(this.phoneNumber, 2);
  }
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  telephoneNumber: string;
  @Expose()
  get maskedTelephoneNumber(): string {
    return MaskHelper.mask(this.telephoneNumber, 2);
  }
  @Expose()
  @Type(() => PaymentDataResponseDto)
  paymentData: PaymentDataResponseDto;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  notes: string;
  @Expose()
  createdAt: Date;
  @Expose()
  isActive: boolean;
  @Expose()
  profilePath: string;
  @Expose()
  get profilePictureUrl(): string {
    if (!this.profilePath) return null;
    return `${process.env.APP_URL}/public/profile-pictures/${this.profilePath}`;
  }
  @Expose()
  collectorNumber: number;
}
