import { IErrorResult, Result } from '@/shared/domain/dto/result.dto';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';

export interface IDesactivateAssignation {
  assignationId: string;
  reason: string;
}

export abstract class IAssignamentService {
  abstract assignBeneficientToCollector(
    collectorId: string,
    beneficientsIds: string[],
  ): Promise<Result<AssignationReportResponse, IErrorResult>>;
  abstract desactivateAssignations(
    assignations: IDesactivateAssignation[],
  ): Promise<Result<void, IErrorResult>>;
}
