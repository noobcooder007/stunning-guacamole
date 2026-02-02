import { Expose } from 'class-transformer';

export interface AssignationIgnoredReportResponseItem {
  id: string;
  reason: string;
}

export interface AssignationAcceptedReportResponseItem {
  created: string[];
  reactivated: string[];
}

export class AssignationReportResponse {
  @Expose()
  addedCount: number;
  @Expose()
  alreadyAssignedCount: number;
  @Expose()
  limmiteExceededCount: number;
  @Expose()
  addedIds: AssignationAcceptedReportResponseItem;
  @Expose()
  ignoredIds: AssignationIgnoredReportResponseItem[];
}
