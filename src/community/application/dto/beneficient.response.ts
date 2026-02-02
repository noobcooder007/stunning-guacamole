import { Expose, Transform } from 'class-transformer';
import { Address } from '@/community/domain/value-objects/address.vo';

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
  @Transform(({ value }) => {
    return value instanceof Address ? value.toJSON() : value;
  })
  address: Address;
  @Expose()
  //   @Transform(({ value }) => {
  //     return value instanceof PromiseDonation ? value.toJSON() : value;
  //   })
  // promiseDonation: PromiseDonation | null;
  @Expose()
  createdAt: Date;
  @Expose()
  isActive: boolean;
}
