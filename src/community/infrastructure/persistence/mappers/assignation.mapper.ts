import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { ActiveAssignationsResponse } from '@/community/application/dto/active-assignations.response';
import { AssignationSchema } from '../typeorm/schemas/assignation.schema';

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

  public static toResponse(
    assignation: AssignationSchema,
  ): ActiveAssignationsResponse {
    const response = new ActiveAssignationsResponse();
    response.id = assignation.id;
    response.collector = {
      id: assignation.collector.id,
      firstname: assignation.collector.profile.firstname,
      firstLastname: assignation.collector.profile.firstLastname,
      secondLastname: assignation.collector.profile.secondLastname,
    };
    response.beneficient = {
      id: assignation.beneficientId,
      firstname: assignation.beneficient.profile.firstname,
      firstLastname: assignation.beneficient.profile.firstLastname,
      secondLastname: assignation.beneficient.profile.secondLastname,
    };
    response.updatedAt = assignation.updatedAt;
    return response;
  }
}
