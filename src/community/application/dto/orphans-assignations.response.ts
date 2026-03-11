import { Exclude, Expose, Type } from 'class-transformer';

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
export class OrphansAssignationsResponse {
  @Expose()
  id: string;
  @Expose()
  @Type(() => CollectorAssignationResponse)
  lastCollector: CollectorAssignationResponse;
  @Expose()
  @Type(() => BeneficientAssignationResponse)
  beneficient: BeneficientAssignationResponse;
  @Expose()
  reasonDeactivated: string;
}
