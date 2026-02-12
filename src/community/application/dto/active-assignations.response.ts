import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class BeneficientAssignationResponse {
  @Expose()
  id: string;
  @Expose()
  fullname: string;
}

@Exclude()
export class ActiveAssignationsResponse {
  @Expose()
  id: string;
  @Expose()
  @Type(() => BeneficientAssignationResponse)
  beneficient: BeneficientAssignationResponse;
}
