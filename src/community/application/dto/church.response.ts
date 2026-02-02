import { Expose, Transform } from 'class-transformer';
import { Priest } from '@/community/domain/value-objects/priest.vo';
import { Address } from '@/community/domain/value-objects/address.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';

export class ChurchResponse {
  @Expose()
  id: string;
  @Expose()
  @Transform(({ value }) => {
    return value instanceof EcclesialIdentity ? value.toJSON() : value;
  })
  ecclesialIdentity: EcclesialIdentity;
  @Expose()
  @Transform(({ value }) => {
    return value instanceof Address ? value.toJSON() : value;
  })
  address: Address;
  @Expose()
  @Transform(({ value }) => {
    return value instanceof Priest ? value.toJSON() : value;
  })
  priest: Priest;
  @Expose()
  @Transform(({ value }) => {
    return value instanceof Priest ? value.toJSON() : value;
  })
  auxiliarPriest: Priest;
  @Expose()
  @Transform(({ value }) => {
    return value instanceof PhoneNumber ? value.unpack() : value;
  })
  phoneNumber: PhoneNumber;
}
