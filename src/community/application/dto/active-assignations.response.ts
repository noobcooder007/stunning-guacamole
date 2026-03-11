import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CollectorAssignationResponse {
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
export class BeneficientAssignationResponse {
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
export class ActiveAssignationsResponse {
  @Expose()
  id: string;
  @Expose()
  collector: CollectorAssignationResponse;
  @Expose()
  @Type(() => BeneficientAssignationResponse)
  beneficient: BeneficientAssignationResponse;
  @Expose()
  updatedAt: Date;
}
