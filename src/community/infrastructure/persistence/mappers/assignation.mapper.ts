import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';

export interface IAssignationPersistence {
  id: string;
  collectorId: string;
  beneficientId: string;
  reasonDeactivated: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AssignationMapper {
  public static toPersistence(
    assignation: Assignation,
  ): IAssignationPersistence {
    return {
      id: assignation._id.unpack(),
      collectorId: assignation.collectorId.unpack(),
      beneficientId: assignation.beneficientId.unpack(),
      reasonDeactivated: assignation.reasonDeactivate,
      isActive: assignation.isActive,
      createdAt: assignation.createdAt,
      updatedAt: assignation.updatedAt,
    };
  }

  public static toDomain(assignation: IAssignationPersistence): Assignation {
    return Assignation.recreate(assignation.id, {
      collectorId: CollectorId.of(assignation.collectorId),
      beneficientId: BeneficientId.of(assignation.beneficientId),
      reasonDeactivate: assignation.reasonDeactivated,
      createdAt: assignation.createdAt,
      updatedAt: assignation.updatedAt,
      isActive: assignation.isActive,
    });
  }
}
