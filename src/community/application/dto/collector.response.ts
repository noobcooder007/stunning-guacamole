import { Expose } from 'class-transformer';

export class CollectorResponse {
  @Expose()
  id: string;
  @Expose()
  firstname: string;
  @Expose()
  firstLastname: string;
  @Expose()
  secondLastname: string;
  @Expose()
  nss: string;
  @Expose()
  street: string;
  @Expose()
  noExt: string;
  @Expose()
  noInt: string;
  @Expose()
  neighborhood: string;
  @Expose()
  locality: string;
  @Expose()
  city: string;
  @Expose()
  state: string;
  @Expose()
  zipCode: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  telephoneNumber: string;
  @Expose()
  commissionPercent: number;
  @Expose()
  bank: string;
  @Expose()
  reference: string;
  @Expose()
  notes: string;
  @Expose()
  createdAt: Date;
  @Expose()
  isActive: boolean;
}
