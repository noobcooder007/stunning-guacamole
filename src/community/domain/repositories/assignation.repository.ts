import { Injectable } from '@nestjs/common';
import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';

@Injectable()
export abstract class IAssignationRepository {
  abstract save(assignation: Assignation): Promise<void>;
  abstract save(assignations: Assignation[]): Promise<void>;
  abstract findActivesByIds(ids: string[]): Promise<Assignation[]>;
  abstract findByIds(ids: string[]): Promise<Assignation[]>;
  abstract findByCollectorIdWithAssignations(
    collectorId: string,
    beneficientsIds: string[],
  ): Promise<Assignation[]>;
  abstract findAssignationsWithElsewhere(
    collectorId: string,
    beneficientIds: string[],
  ): Promise<Assignation[]>;
  abstract findActiveByCollectorIdAndBeneficientIds(
    collectorId: string,
    beneficientIds: string[],
  ): Promise<Assignation[]>;
  abstract findActivesByBeneficientsIds(
    beneficientsIds: string[],
  ): Promise<Assignation[]>;
  abstract findActivesByCollectorId(
    collectorId: string,
  ): Promise<Assignation[]>;
}
