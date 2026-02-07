import { Exclude, Expose, Type } from 'class-transformer';
import { AddressResponseDto } from '@/community/application/dto/address.response';
import { MaskHelper } from '@/shared/infrastructure/utils/mask-helper.util';

@Exclude()
export class BeneficientResponse {
  @Expose()
  id: string;
  @Expose()
  title: string;
  @Expose()
  firstname: string;
  @Expose()
  firstLastname: string;
  @Expose()
  secondLastname: string;
  @Expose()
  birthday: Date;
  @Expose()
  genre: string;
  @Expose()
  maritalStatus: string;
  @Expose()
  weddingAniversary: Date | null;
  @Expose()
  @Type(() => AddressResponseDto)
  address: AddressResponseDto;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  email: string | null;
  @Expose()
  get emailMasked() {
    return MaskHelper.maskEmail(this.email);
  }
  @Expose()
  person: string | null;
  @Expose()
  registeredName: string | null;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  rfc: string | null;
  @Expose()
  get rfcMasked() {
    return MaskHelper.mask(this.rfc, 4, 'X');
  }
  @Expose()
  createdAt: Date;
  @Expose()
  isActive: boolean;
}
