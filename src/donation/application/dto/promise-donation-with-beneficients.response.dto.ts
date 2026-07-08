import { Exclude, Expose, Type } from 'class-transformer';
import { ICollectorInstructionsPersistence } from '@/donation/infrastructure/persistence/mappers/promise-donation.mapper';

@Exclude()
export class PromiseDonationBeneficientResponse {
  @Expose()
  id: string;
  @Expose()
  firstname: string;
  @Expose()
  firstLastname: string;
  @Expose()
  secondLastname: string;
}

@Exclude()
export class PromiseDonationWithBeneficientsResponse {
  @Expose()
  id: string;
  @Expose()
  @Type(() => PromiseDonationBeneficientResponse)
  beneficient: PromiseDonationBeneficientResponse;
  @Expose()
  promiseAmount: number;
  @Expose()
  currency: string;
  @Expose()
  method: string;
  @Expose()
  startDate: Date;
  @Expose()
  recurring: boolean;
  @Expose()
  recurrence: number;
  @Expose()
  lastDonation?: Date;
  @Expose()
  nextDonation?: Date;
  @Expose()
  isActive: boolean;
  @Expose()
  reasonDeactivate?: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  instructions?: ICollectorInstructionsPersistence;
}
