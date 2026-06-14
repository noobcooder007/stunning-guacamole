import { IErrorResult, Result } from '@/shared/domain/dto/result.dto';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';

export interface IDeactivateAssignation {
  assignationId: string;
  reason: string;
}

export interface AssignationServiceResult {
  report: AssignationReportResponse;
  activatedBeneficientIds: string[];
}

export abstract class IAssignamentService {
  abstract createOrReactivate(
    collectorId: string,
    beneficientsIds: string[],
    options?: { validateCollector?: boolean },
  ): Promise<Result<AssignationServiceResult, IErrorResult>>;
  abstract deactivate(
    assignations: IDeactivateAssignation[],
  ): Promise<Result<void, IErrorResult>>;
}
